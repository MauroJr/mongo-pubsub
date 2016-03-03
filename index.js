'use strict';
const MongoObserver = require('mongo-observer');

module.exports = {
    Publisher: require('./lib/publisher'),
    Subscriber: require('./lib/subscriber'),
    getMongoConnection: MongoObserver.getMongoConnection,
    ObjectID: MongoObserver.ObjectID
};