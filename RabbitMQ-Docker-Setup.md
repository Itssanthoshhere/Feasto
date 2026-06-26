# RabbitMQ and Docker Setup

This guide provides instructions for setting up RabbitMQ using Docker for the Feasto project.

## Running RabbitMQ using Docker

To start a RabbitMQ container with the management plugin enabled, run the following command in your terminal:

```bash
docker run -d \
  --hostname rabbitmq-host \
  --name rabbitmq-container \
  -e RABBITMQ_DEFAULT_USER=admin \
  -e RABBITMQ_DEFAULT_PASS=admin123 \
  -p 5672:5672 \
  -p 15672:15672 \
  rabbitmq:3-management
```

### Breakdown of the command:
- `-d`: Runs the container in detached mode (in the background).
- `--hostname rabbitmq-host`: Sets the hostname inside the container.
- `--name rabbitmq-container`: Assigns a specific name to the container for easier management.
- `-e RABBITMQ_DEFAULT_USER=admin`: Sets the default admin username.
- `-e RABBITMQ_DEFAULT_PASS=admin123`: Sets the default admin password.
- `-p 5672:5672`: Maps the standard AMQP protocol port (used by applications to connect).
- `-p 15672:15672`: Maps the management UI port.
- `rabbitmq:3-management`: The image used, which includes the web-based management dashboard.

## Accessing the Management UI

Once the container is running, you can access the RabbitMQ Management Dashboard via your browser:

- **URL**: [http://localhost:15672](http://localhost:15672)
- **Username**: `admin`
- **Password**: `admin123`

## Useful Docker Commands

- **Check running containers:**
  ```bash
  docker ps
  ```

- **Stop the RabbitMQ container:**
  ```bash
  docker stop rabbitmq-container
  ```

- **Start an existing stopped container:**
  ```bash
  docker start rabbitmq-container
  ```

- **View container logs:**
  ```bash
  docker logs rabbitmq-container
  ```
