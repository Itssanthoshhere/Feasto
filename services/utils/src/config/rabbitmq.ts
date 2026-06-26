import amqp from "amqplib";

let channel: amqp.Channel;

export const connectRabbitMQ = async () => {
  const connection = await amqp.connect(process.env.RABBITMQ_URL!);

  channel = await connection.createChannel();

  await channel.assertQueue(process.env.PAYMENT_QUEUE!, {
    durable: true, // retry when failed
  });

  console.log("🐇 Connected To Rabbitmq");
};

export const getChannel = () => channel;
