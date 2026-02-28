# RetroVideoGameExchange API

## Run With Docker

Build the image:

```bash
docker build -t retro-game-exchange:latest .
```

Run the container (API on `http://localhost:3000`, Swagger docs on `http://localhost:3000/docs`):

```bash
docker run --rm -p 3000:3000 \
  -e DB_HOST=host.docker.internal \
  -e DB_PORT=3306 \
  -e DB_USER=root \
  -e DB_PASSWORD=root \
  -e DB_NAME=game_exchange \
  -e JWT_SECRET="replace-with-your-secret" \
  -e KAFKA_BROKERS="kafka:9092" \
  -e KAFKA_USER_TOPIC="user" \
  -e KAFKA_OFFERS_TOPIC="offers" \
  -e KAFKA_CLIENT_ID="retro-game-exchange-api" \
  retro-game-exchange:latest
```

If you are on Linux and using a database on your host machine, add:

```bash
--add-host=host.docker.internal:host-gateway
```

Example (Linux host DB):

```bash
docker run --rm -p 3000:3000 \
  --add-host=host.docker.internal:host-gateway \
  -e DB_HOST=host.docker.internal \
  -e DB_PORT=3306 \
  -e DB_USER=root \
  -e DB_PASSWORD=root \
  -e DB_NAME=game_exchange \
  -e JWT_SECRET="replace-with-your-secret" \
  -e KAFKA_BROKERS="kafka:9092" \
  -e KAFKA_USER_TOPIC="user" \
  -e KAFKA_OFFERS_TOPIC="offers" \
  -e KAFKA_CLIENT_ID="retro-game-exchange-api" \
  retro-game-exchange:latest
```

## Environment Variables

Required for API + DB:

- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `JWT_SECRET`

Kafka notification stream:

- `KAFKA_BROKERS` (required to publish notifications, comma-separated)
- `KAFKA_USER_TOPIC` (optional, default: `user`)
- `KAFKA_OFFERS_TOPIC` (optional, default: `offers`)
- `KAFKA_CLIENT_ID` (optional, default: `retro-game-exchange-api`)

## Docker MySQL Examples

### 1. MySQL in a Container (via host port)

Start MySQL:

```bash
docker run -d --name mysql-db \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=game_exchange \
  -p 3306:3306 \
  mysql:8.4
```

Start API container (connects through host port):

```bash
docker run --rm -p 3000:3000 \
  --add-host=host.docker.internal:host-gateway \
  -e DB_HOST=host.docker.internal \
  -e DB_PORT=3306 \
  -e DB_USER=root \
  -e DB_PASSWORD=root \
  -e DB_NAME=game_exchange \
  -e JWT_SECRET="replace-with-your-secret" \
  -e KAFKA_BROKERS="kafka:9092" \
  -e KAFKA_USER_TOPIC="user" \
  -e KAFKA_OFFERS_TOPIC="offers" \
  -e KAFKA_CLIENT_ID="retro-game-exchange-api" \
  retro-game-exchange:latest
```

### 2. API + MySQL on the Same Docker Network

Create network:

```bash
docker network create game-net
```

Start MySQL on that network:

```bash
docker run -d --name mysql-db --network game-net \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=game_exchange \
  mysql:8.4
```

Start API on the same network (use MySQL container name as host):

```bash
docker run --rm -p 3000:3000 --network game-net \
  -e DB_HOST=mysql-db \
  -e DB_PORT=3306 \
  -e DB_USER=root \
  -e DB_PASSWORD=root \
  -e DB_NAME=game_exchange \
  -e JWT_SECRET="replace-with-your-secret" \
  -e KAFKA_BROKERS="kafka:9092" \
  -e KAFKA_USER_TOPIC="user" \
  -e KAFKA_OFFERS_TOPIC="offers" \
  -e KAFKA_CLIENT_ID="retro-game-exchange-api" \
  retro-game-exchange:latest
```

## Kafka on the Same Docker Network

If Kafka is running in a container on the same Docker network as your API, set:

- `KAFKA_BROKERS="<kafka-container-name>:<kafka-port>"`

Example (Kafka container named `kafka` on `game-net`):

```bash
docker run --rm -p 3000:3000 --network game-net \
  -e DB_HOST=mysql-db \
  -e DB_PORT=3306 \
  -e DB_USER=root \
  -e DB_PASSWORD=root \
  -e DB_NAME=game_exchange \
  -e JWT_SECRET="replace-with-your-secret" \
  -e KAFKA_BROKERS="kafka:9092" \
  -e KAFKA_USER_TOPIC="user" \
  -e KAFKA_OFFERS_TOPIC="offers" \
  -e KAFKA_CLIENT_ID="retro-game-exchange-api" \
  retro-game-exchange:latest
```
