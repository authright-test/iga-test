# local dev guide

## pre-requisites

* docker
* node 20+

## switch hosts

> 127.0.0.1 iga-mvp.local

## webhook channel

test channel: https://smee.io/gIwOJ7LdT9Lc2is9

run the cmd below to forward the webhook request to local dev server

> smee -u https://smee.io/gIwOJ7LdT9Lc2is9 -t http://iga-mvp.local:8080/webhook

## start local env

> ./restart-dev-env.sh

## start dev server

start backend & frontend

> cd backend
> yarn dev

> cd frontend
> yarn dev

## visit in browser

> http://iga-mvp.local:8080

## More

Chakra UI 3.19 migration guide

https://chakra-ui.com/docs/get-started/migration
