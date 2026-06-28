import amqp from "amqplib";
import { startOrderReadyConsumer } from "./orderReady.consumer.js";

let channel: amqp.Channel;
let isReconnecting = false;

export const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL!);

    connection.on("error", (err) => {
      console.error("RabbitMQ connection error", err);
    });

    connection.on("close", () => {
      console.error("RabbitMQ connection closed. Reconnecting...");
      if (!isReconnecting) {
        isReconnecting = true;
        const attemptReconnect = async () => {
          try {
            await connectRabbitMQ();
            await startOrderReadyConsumer();
          } catch (err) {
            console.error("Reconnect attempt failed", err);
            setTimeout(attemptReconnect, 5000);
          } finally {
            isReconnecting = false;
          }
        };
        setTimeout(attemptReconnect, 5000);
      }
    });

    channel = await connection.createChannel();

    channel.on("error", (err) => {
      console.error("RabbitMQ channel error", err);
    });

    channel.on("close", () => {
      console.error("RabbitMQ channel closed");
    });

    await channel.assertQueue(process.env.RIDER_QUEUE!, {
      durable: true,
    });
    await channel.assertQueue(process.env.ORDER_READY_QUEUE!, {
      durable: true,
    });

    console.log("🐇 connected To Rabbitmq(rider service)");
  } catch (error) {
    console.error("Failed to connect to RabbitMQ", error);
    throw error;
  }
};

export const getChannel = () => channel;
