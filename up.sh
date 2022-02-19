#!/usr/bin/bash
# build the PHP application container
docker-compose build --build-arg user=$(whoami) --build-arg uid=$(id -u)

# install the Loki docker driver to read all container logs
docker plugin install grafana/loki-docker-driver:latest --alias loki-compose --grant-all-permissions

# bring up all services
docker-compose up -d

# run initial setup
docker-compose exec php bash -c 'php artisan vendor:publish --all'
docker-compose exec php bash -c 'php artisan storage:link'
docker-compose exec php bash -c 'php artisan optimize'
docker-compose exec php bash -c 'composer dump-autoload'
docker-compose exec php bash -c 'rm -rf /var/www/public/installer'