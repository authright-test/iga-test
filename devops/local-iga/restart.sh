#!/bin/bash -e
docker-compose -f server.yml down
docker-compose -f server.yml up -d
