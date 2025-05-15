FROM mysql:8.0.31
ADD ./etc/mysql/8/1.main.sql /docker-entrypoint-initdb.d/1.main.sql
ADD ./etc/mysql/8/2.stage.sql /docker-entrypoint-initdb.d/2.stage.sql
ADD ./etc/mysql/8/3.dev.sql /docker-entrypoint-initdb.d/3.dev.sql
EXPOSE 3306
CMD ["mysqld", "--character-set-server=utf8mb4", "--collation-server=utf8mb4_unicode_ci"]
