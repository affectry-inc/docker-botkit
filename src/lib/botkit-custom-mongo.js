'use strict';

var monk = require('monk');

/**
 * botkit-storage-mongo - MongoDB driver for Botkit
 *
 * @param  {Object} config Must contain a mongoUri property
 * @return {Object} A storage object conforming to the Botkit storage interface
 */
module.exports = function(config) {
    /**
     * Example mongoUri is:
     * 'mongodb://test:test@ds037145.mongolab.com:37145/slack-bot-test'
     * or
     * 'localhost/mydb,192.168.1.1'
     */
    if (!config || !config.mongoUri) {
        throw new Error('Need to provide mongo address.');
    }

    var db = monk(config.mongoUri),
        storage = {};

    var zones = ['teams', 'channels', 'users'];

    if (config.collections) zones = zones.concat(config.collections);

    zones.forEach(function(zone) {
        storage[zone] = getStorage(db, zone);
    });

    return storage;
};

/**
 * Creates a storage object for a given "zone", i.e, teams, channels, or users
 *
 * @param {Object} db A reference to the MongoDB instance
 * @param {String} zone The table to query in the database
 * @returns {{get: get, save: save, all: all, select: select}}
 */
function getStorage(db, zone) {
    var table = db.get(zone);

    return {
        get: function(id, cb) {
            table.findOne({id: id}, cb);
        },
        save: function(data, cb) {
            table.findOneAndUpdate({
                id: data.id
            }, data, {
                upsert: true,
                new: true
            }, cb);
        },
        remove: function(id) {
            table.remove({id: id});
        },
        all: function(cb) {
            table.find({}, cb);
        },
        select: function(_selector, _sort, cb) {
            var selector = _selector ? _selector : {};
            var sort = _sort ? {sort: _sort} : {};
            table.find(selector, sort, cb);
        }
    };
}
