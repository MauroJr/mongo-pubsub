'use strict';

const toFactory             = require('tofactory'),
      getMongoConnection    = require('mongo-observer').getMongoConnection;


module.exports = toFactory(Cache);


function Cache(spec) {
    const cache = Object.create(null);
          
    let db;
    
    init();
    
    return {
        sync,
        'get': get,
        insert,
        remove
    };
    
    function init() {
        getMongoConnection(spec, function (err, dbConn) {
            if (err) throw err;
            db = dbConn;
        });
    }
    
    function get(collection, id) {
        return getCollection(collection)[id];
    }
    
    function insert(collection, id, data, next) {
        getCollection(collection)[id] = data;
    }
    
    function remove(collection, id) {
        delete getCollection(collection)[id];
    }
    
    function sync(collection, id, data, next) {
        const col = getCollection(collection),
              doc = col[id];
        
        if (doc) {
            col[id] = Object.assign(doc, data);
            next(undefined, data);
        } else {
            findOneById(collection, id, function (err, doc) {
                if (err) return next(err);
                col[id] = doc;
                next(undefined, doc);
            });
        }
    }
    
    function findOneById(colName, id, next) {
        if (db) {
            db.collection(colName, function (err, col) {
                if (err) return next(err);
                col.find({_id: id}).limit(1).next(function (err, doc) {
                    if (err) return next(err);
                    return next(undefined, doc);
                });
            });
        } else {
            next(new Error('no database connection'));
        }
    }
    
    function getCollection(collection) {
        return cache[collection] || (cache[collection] = {});
    }
}