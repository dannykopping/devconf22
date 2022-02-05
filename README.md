# Setup

## Docker

Build the PHP container:

```bash
docker-compose build --build-arg user=$(whoami) --build-arg uid=$(id -u)
```

Install the docker driver for Loki:
```bash
docker plugin install grafana/loki-docker-driver:latest --alias loki-compose --grant-all-permissions
```

Then start up all the services:

```bash
docker-compose up -d
```

## Application

Setup the application:

```bash
docker-compose exec php bash -c 'php artisan bagisto:install'
```

### Services

- Shop: http://localhost:8000/
- Grafana: http://localhost:3000/