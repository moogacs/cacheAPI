var  mongoConfig  = {
    maxCachEntries : 2,
    ttl: 2 * Math.pow(10, 3), // 2 sec.
    host: "localhost",
    port: 27017,
    username: "",
    pw: "",
    db:"cache",
    collection: "keys",   
    APIMainRoute: "/api/v1/cache", 
    getItemEndPoint: "get",
    getAllEndPoint: "getAll",
    updateItemEndPoint: "update",
    deleteItemEndPoint: "delete",
    deleteAllEndPoint: "deleteAll",
}

exports.mongo = mongoConfig;
