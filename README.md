# CacheAPI (MEAN)
cacheAPI for MEAN stack



Avaliable Endpoints :

POST: http://localhost/api/v1/cache/get?key=18
GET : http://localhost/api/v1/cache/getall
POST : http://localhost/api/v1/cache/delete?key=18&value=abcd
POST : http://localhost/api/v1/cache/update?key=18&value=asdasd
POST : http://localhost/api/v1/cache/deleteall


###config.js
 is used for defining:
 * configuration for mongoDB client (username, pw, ip, host etc.)
 * Maximum entries in the cache
 * TimeToLive for validating the cache entery
 * Endpoints

