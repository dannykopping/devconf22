#!/usr/bin/bash
# build the PHP application container
docker-compose build --build-arg user=$(whoami) --build-arg uid=$(id -u)

# install the Loki docker driver to read all container logs
docker plugin install grafana/loki-docker-driver:latest --alias loki-compose --grant-all-permissions

# bring up all services
docker-compose up -d

# run initial setup
docker-compose exec php bash -c 'php artisan bagisto:install'

# setup sample categories
docker-compose exec php bash -c '(echo 3; echo 3; echo 3; echo yes) | php artisan seed:fake:data'

# setup sample products
docker-compose exec php bash -c '(echo 2; echo 50; echo yes; echo no) | php artisan seed:fake:data'