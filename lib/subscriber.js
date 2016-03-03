'use strict';
const debug         = require('debug')('mongo-pubsub:subscriber'),
      toFactory     = require('tofactory'),
      createEmitter = require('create-emitter'),
      axon          = require('axon'),
      Cache         = require('./cache');

module.exports = toFactory(Subscriber);

function Subscriber(spec) {
    let cache;
    
    const sub       = axon.socket('sub-emitter'),
          emitter   = createEmitter.create();
    
    const _return = {
        connect,
        on: emitter.on,
        off: emitter.off
    };
    
    init();
    
    return _return;
    
    function init() {
        cache = Cache.create(spec);
        
        sub.on('*:*:*', function (collection, operation, _id, data) {
            const route = `${collection}:${operation}:${_id}`;
            
            switch (operation) {
                case 'update':
                    cache.sync(collection, _id, data, 
                        function (err, changes, doc) {
                            if (err) return debug(err);
                            emitter.emit(route, changes);
                            emitter.emit(route + ':$cache', changes, doc);
                        });
                    break;
                case 'insert':
                    cache.insert(collection, _id, data);
                    emitter.emit(route, data);
                    break;
                case 'remove':
                    cache.remove(collection, _id);
                    emitter.emit(route);
            }
        });
    }
    
    function connect(arg) {
        if (arg) {
            sub.connect(arg);
        } else {
            sub.connect(spec.connect);
        }
        return _return;
    }
}