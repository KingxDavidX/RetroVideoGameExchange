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
  retro-game-exchange:latest
```

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
  retro-game-exchange:latest
```
