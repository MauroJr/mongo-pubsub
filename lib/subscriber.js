'use strict';
const debug         = require('debug')('mongo-pubsub:subscriber'),
      toFactory     = require('tofactory'),
      createEmitter = require('create-emitter'),
      axon          = require('axon');

module.exports = toFactory(Subscriber);

function Subscriber(spec) {
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
        
        sub.on('*:*:*', function (collection, operation, _id, data) {
            const route = `${collection}:${operation}:${_id}`;
            
            switch (operation) {
                case 'update':
                    emitter.emit(route, data);
                    break;
                case 'insert':
                    emitter.emit(route, data);
                    break;
                case 'remove':
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