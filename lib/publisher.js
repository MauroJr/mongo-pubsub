'use strict';
const toFactory     = require('tofactory'),
      axon          = require('axon'),
      MongoObserver = require("mongo-observer");

module.exports = toFactory(Publisher);

function Publisher(spec) {
    const mongo = MongoObserver.create(spec),
          pub   = axon.socket('pub-emitter');
    
    const publisher = {
        bind
    };
    
    init();
    
    return publisher;
    
    function init() {
        mongo.on('*:*:*', function (collection, operation, _id, data) {
            pub.emit(`${collection}:${operation}:${_id}`, data);
        });
    }
    
    function bind(arg) {
        if (arg) {
            pub.bind(arg);
        } else {
            pub.bind(spec.bind);
        }
        mongo.observe();
        return publisher;
    }
    
}
