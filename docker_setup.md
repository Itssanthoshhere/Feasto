# Docker Setup and Build Instructions

## Docker Login
Before pushing images, authenticate with Docker Hub:
```bash
docker login
```

## Build and Push Services

### Auth Service
```bash
docker build -t feasto-auth .
docker tag feasto-auth sandyy02/feasto-auth:latest
docker push sandyy02/feasto-auth:latest

docker buildx build \
  --platform linux/amd64 \
  -t sandyy02/feasto-auth:latest \
  --push .
```

### Restaurant Service
```bash
docker build -t feasto-restaurant .
docker tag feasto-restaurant sandyy02/feasto-restaurant:latest
docker push sandyy02/feasto-restaurant:latest

docker buildx build \
  --platform linux/amd64 \
  -t sandyy02/feasto-restaurant:latest \
  --push .
```

### Rider Service
```bash
docker build -t feasto-rider .
docker tag feasto-rider sandyy02/feasto-rider:latest
docker push sandyy02/feasto-rider:latest

docker buildx build \
  --platform linux/amd64 \
  -t sandyy02/feasto-rider:latest \
  --push .
```

### Utils Service
```bash
docker build -t feasto-utils .
docker tag feasto-utils sandyy02/feasto-utils:latest
docker push sandyy02/feasto-utils:latest

docker buildx build \
  --platform linux/amd64 \
  -t sandyy02/feasto-utils:latest \
  --push .
```

### Realtime Service
```bash
docker build -t feasto-realtime .
docker tag feasto-realtime sandyy02/feasto-realtime:latest
docker push sandyy02/feasto-realtime:latest

docker buildx build \
  --platform linux/amd64 \
  -t sandyy02/feasto-realtime:latest \
  --push .
```

### Admin Service
```bash
docker build -t feasto-admin .
docker tag feasto-admin sandyy02/feasto-admin:latest
docker push sandyy02/feasto-admin:latest

docker buildx build \
  --platform linux/amd64 \
  -t sandyy02/feasto-admin:latest \
  --push .
```

---

## Server Setup Instructions

### 1. Update package list
```bash
sudo apt-get update -y
```

### 2. Install Docker
```bash
sudo apt-get install docker.io -y
```

### 3. Enable and start Docker service
```bash
sudo systemctl enable docker
sudo systemctl start docker
```

### 4. Give current user permission to run Docker commands
*Note: This requires a logout/login to take effect.*
```bash
sudo usermod -aG docker $USER
```

### 5. Pull and run RabbitMQ container with management UI
```bash
sudo docker run -d \
  --hostname rabbitmq-host \
  --name rabbitmq-container \
  -e RABBITMQ_DEFAULT_USER=admin \
  -e RABBITMQ_DEFAULT_PASS=admin123 \
  -p 5672:5672 \
  -p 15672:15672 \
  rabbitmq:3-management
```
