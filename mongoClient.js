

var config = require('./config.js');
var MongoClient = require('mongodb').MongoClient

var database
var collection

var  mongoClient  = {

    connect : function (){        
        url = "mongodb://" +  config.mongo.host + ":"+  + config.mongo.port + "/" + config.mongo.db
        if (config.mongo.username.lenght > 0){
            url = "mongodb://" + config.mongo.username + ":" + config.mongo.pw + "@" + config.mongo.host + ":"+  + config.mongo.port + "/" + config.mongo.db
        }
        
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            
            var dbo = db.db("cache");
            database  = dbo.createCollection(config.mongo.collection, function(err, res) {
                if (err) throw err;
                console.log("Collection created!");        
                collection = dbo.collection("keys")
                // db.close();
            })
            
            console.log("Connected to `" + "cache" + "`!");
        });
    
    },
    find : function(key) {
        return new Promise(function(resolve, reject) {
            var filter =  {"key": key}
            var sortFilter = {updatedAt : 1}
            collection.find(filter, {projection:{_id:0}}).sort(sortFilter).toArray( function(err, res) {
                if (err) reject(err); 
                resolve(res)
            })
        })
    },
    create : function(key){
        return new Promise(function(resolve, reject) {
            var cacheValue = mongoClient.randomString(10);
            let existedCacheCount = 0 
            /**
             * counting existed elements with every getItem endpoint is called  
             *  find the element if existed or not 
             * if not existed compare count of current existed cached elements 
             * if it's < ignore and insert 
             * else then we need to update "find" calling the items 
             * and sort the returned array based on updateTime there fore we update 
             * the one is far in updateTime FIFO 
             */
            collection.countDocuments( {}, function(err, countResponse){
                if (err) reject(err)                
                existedCacheCount = countResponse
        
                mongoClient.find(key).
                then(findResponse => {  

                    if(findResponse.length != 0){                      
                        console.log("Cache hit")                        
                        var expired = findResponse[0].ttl - new Date().getTime() < 0                                                 

                        if (expired){
                            var randomValue = mongoClient.randomString(10);
                            mongoClient.updateItem(findResponse[0].key, randomValue)
                            findResponse[0].value = randomValue
                            resolve(findResponse[0]) 
                        }else{                            
                            mongoClient.updateItem(findResponse[0].key, findResponse[0].value)
                            resolve(findResponse[0]) 
                        }     

                    }else{

                        console.log("Cache miss")

                        // check if we need to update regarding the limitation of the max. entery count
                        if(existedCacheCount < config.mongo.maxCachEntries){ 
                            var cacheObject = { key: key, value:cacheValue, createdAt: new Date().getTime(), updatedAt: new Date().getTime(), ttl: new Date().getTime() + config.mongo.ttl};

                            collection.insertOne(cacheObject, {projection:{_id:0}}, function(err, insertResponse) {
                                if (err) reject(err); 
                            })       

                            delete cacheObject["_id"] // mongoDB it seems to "_id" to the object 
                            resolve(cacheObject)
                        }else{                               
                            mongoClient.getAllItems().then(allResponse => {
                                var cacheObject = { key: key, value:cacheValue, createdAt: new Date().getTime(), updatedAt: new Date().getTime()};
                                allResponse.sort((a,b) => {
                                    return a.updatedAt - b.updatedAt
                                })
                                console.log(allResponse)
                                mongoClient.updateItem(allResponse[0].key, cacheValue, key)
                                resolve(cacheObject)
                            })                        
                        }   

                    }  
                }).catch(err=> {
                    console.log(err)
                }) 

            })                                   
        })

    },
    getAllItems: function (){    
        return new Promise(function(resolve, reject) {
            collection.find({}, {projection:{_id:0}}).toArray( function(err, dbres) {            
                if (err) reject(err); 
                resolve( dbres)
            });
        })        
    },
    updateItem: function(key, newValue, newKey = null){
        return new Promise(function(resolve, reject) {

            var newValues =  { $set: {"key": key, "value": newValue, updatedAt: new Date().getTime(), ttl: new Date().getTime()+ config.mongo.ttl}}

            if(newKey){
                newValues =  { $set: {"key": newKey, "value": newValue, updatedAt: new Date().getTime(), ttl: new Date().getTime() + config.mongo.ttl}}
            }

            var filter =  {"key": key}
            collection.updateOne(filter, newValues, function(err, res) {
                if (err) reject(err)
                resolve(res)      
            });           
        })
    },
    delete: function(key){
        return new Promise(function(resolve, reject) {
            
            var filter =  {"key": key}

            collection.deleteOne(filter, function(err, res) {
                if (err) reject(err);
                resolve(res)                      
            });

        })
    },
    deleteAll: function(){
        return new Promise(function(resolve, reject) {        
            collection.deleteOne({}, function(err, res) {
                if (err) reject(err);
                resolve(res)                      
            });

        })
    },
    randomString: function (length) {
        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
           result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

}




exports.mongo = mongoClient;