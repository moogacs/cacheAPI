var express = require('express');
var app = express();
var config = require('./config.js');
var cacheMongoClient = require('./mongoClient.js');



/**
 * local implemented client for the purpose of the cache API 
 */
cacheMongoClient.mongo.connect()


app.listen(80, function () {
    console.log('CacheAPI listening on port 80!');
})


app.get('/', function (req, res) {        
    res.send("Hmm!")
})

/**
 * get creates item if not exists
 */
app.post(config.mongo.APIMainRoute+'/' + config.mongo.getItemEndPoint, function (req, res) {        

    const {key = null} = req.query
    if (key == null){
        res.status(422).send({
            "success": false,
            "error": "something is missing",                
        })        
        return
    }

    
    cacheMongoClient.mongo.create(key).
    then(dbresponse => {

        res.status(200).send({
            "success": true,
            "results": dbresponse
        })                 
    })
    .catch(err => {
        console.log(err)
    }) 
    
});

/**
 * getAll
 */

app.get(config.mongo.APIMainRoute+'/' + config.mongo.getAllEndPoint, function (req, res) {   

    cacheMongoClient.mongo.getAllItems().
    then(dbresponse => {
        res.status(200).send({
            "success": true,
            "results": dbresponse,                
        })            
    }).
    catch(err => {
        console.log(err)
    }) 
    
});


/**
 * updateKey
 */


app.post(config.mongo.APIMainRoute+'/' + config.mongo.updateItemEndPoint, function (req, res) {        

    const {key = null, value = null} = req.query
    if (key == null || value == null){
        res.status(422).send({
            "success": false,
            "error": "something is missing",                
        })        
        return
    }

    cacheMongoClient.mongo.updateItem(key, value).
    then(dbresponse => {        
        res.status(200).send({
            "success": true,
            "key": key, 
            "value": value,                 
        })  
    }).
    catch(err => {
        console.log(err)
    })     
});




/**
 * removeKey
 */


app.post(config.mongo.APIMainRoute+'/' + config.mongo.deleteItemEndPoint, function (req, res) {        

    const {key = null} = req.query
    if (key == null){
        res.status(422).send({
            "success": false,
            "error": "something is missing",                
        })        
        return
    }

    cacheMongoClient.mongo.delete(key).
    then(dbresponse => {        
        if (dbresponse.deletedCount == 0){
            res.status(200).send({
                "success": false,
                "error": "item not found",                                 
            })  
        }
        else{
            res.status(200).send({
                "success": true,
                "deletedKey": key,                                 
            })  
        }
    }).
    catch(err => {
        console.log(err)
    })  
    
});


app.post(config.mongo.APIMainRoute+'/' + config.mongo.deleteAllEndPoint, function (req, res) {        

    cacheMongoClient.mongo.deleteAll().
    then(dbresponse => {        
        res.status(200).send({
            "success": true,                              
        })  
    }).
    catch(err => {
        console.log(err)
    }) 
    
});


app.get('*', function(req, res){
    res.status(404).send({
        "success": false,   
        "error": "Not found"
    });
});