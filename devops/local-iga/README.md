# IGA Local

## Get Started

1. run build db

```
> ./build-db.sh 
```

2. run docker-compose

```bash
> docker-compose up -d
```


## Clean up And Restart

1. clean up

```bash
> docker-compose down -v
> ./rm-db.sh
```

2. rebuild and restart

```bash
> ./build-db.sh
> docker-compose up -d
```
