#!/usr/bin/bash
# build the PHP application container
docker-compose build --build-arg user=$(whoami) --build-arg uid=$(id -u)

# install the Loki docker driver to read all container logs
docker plugin install grafana/loki-docker-driver:latest --alias loki-compose --grant-all-permissions

# bring up all services
docker-compose up -d app

# run initial setup
docker-compose exec app bash -c 'composer install -vvv'
docker-compose exec app bash -c 'php artisan vendor:publish --all'
docker-compose exec app bash -c 'php artisan storage:link'
docker-compose exec app bash -c 'php artisan cache:clear'
docker-compose exec app bash -c 'php artisan config:clear'
docker-compose exec app bash -c 'composer dump-autoload'
docker-compose exec app bash -c 'php artisan optimize'
docker-compose exec app bash -c 'rm -rf /var/www/public/installer'

# create sample users and accounts
docker-compose run --rm k6 < k6/setup.js