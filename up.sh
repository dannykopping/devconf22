#!/usr/bin/bash

# install the Loki docker driver to read all container logs
# docker plugin install grafana/loki-docker-driver:latest --alias loki-compose --grant-all-permissions

# bring up all services
docker-compose up -d slackernews grafana

sleep 2

# create sample users
docker-compose run --rm k6 run /app/setup.js