#!/usr/bin/env bash

# generate orders
docker-compose run --rm k6 run --vus 10 --iterations 100 - < k6/simulate.js