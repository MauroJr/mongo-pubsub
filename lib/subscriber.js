'use strict';
const toFactory     = require('tofactory'),
      createEmitter = require('create-emitter'),
      axon          = require('axon');

module.exports = toFactory(Subscriber);

function Subscriber(spec) {
    const sub       = axon.socket('sub-emitter'),
          emitter   = createEmitter.create();
    
    const subscriber = {
        connect,
        on: emitter.on,
        off: emitter.off
    };
    
    init();
    
    return subscriber;
    
    function init() {
        sub.on('*:*:*', function (collection, operation, _id, data) {
            emitter.emit(`${collection}:${operation}:${_id}`, data);
        });
    }
    
    function connect(arg) {
        if (arg) {
            sub.connect(arg);
        } else {
            sub.connect(spec.connect);
        }
        return subscriber;
    }
}