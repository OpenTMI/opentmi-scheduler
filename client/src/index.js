'use strict';

// native modules
var crypto = require('crypto');
var os = require('os');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

// 3rd party modules
var _ = require('lodash');
var io = require('socket.io-client');


var logger = {
  silly: console.log,
  debug: console.log,
  info: console.log,
  warn: console.log,
  error: console.log
};

var Client = function (options) {
  options = options || {};
  this.url = options.url || 'http://localhost:3000/scheduler';
  logger = options.logger || logger;
  this._executor = options.executor;
  this.client_info = {
    id: crypto.createHash('md5').update(os.hostname()).digest('hex').toString(),
    host: {
      cpu_architecture: os.arch(),
      cpu_count: os.cpus().length,
      platform: os.platform()
    },
    app: {
      pid: process.pid,
    },
    capabilities: []
  } 
}
util.inherits(Client, EventEmitter);

// class methods
Client.prototype.addCapability = function(capability) {
    this.client_info.capabilities.push({id: capability});
}
Client.prototype.connect = function() {
  logger.silly('connecting..');
  this._socket = io.connect(this.url);
  this._socket.on('connect', this._onConnected.bind(this));
  this._socket.on('reconnect', this._onConnected.bind(this));
  this._socket.on('disconnect', this._onDisconnected.bind(this));
};
// class internal functions:
Client.prototype._onDisconnected = function() {
  logger.warn('Scheduler connetion lost');
}
Client.prototype._onConnected = function() {
  logger.info('connected. send register_request');
  this._socket.removeAllListeners();
  this._socket.emit('register_request', this.client_info);
  this._socket.once('register_response', this._register_response.bind(this));
};
Client.prototype._register_response = function(data) {
    logger.silly("register_response:", data);
    //@todo check if host accept my registering..
    this._available();
};
Client.prototype._available = function(data) {
    data = data || {};
    logger.info('Im available..let server to know it..')
    this._socket.emit('available', data);
    this._socket.once('job_request', this._job_request.bind(this));
}
Client.prototype._job_execute = function(job, done) {
    logger.info('Executing job:', job);
    if(_.isFunction(this._executor)) {
      this._executor(job, done);
    } else {
      logger.error("executor missing!");
    } 
}
Client.prototype._job_request = function(data, accept) {
    logger.debug('Job request accepted:', data);
    accept({accept: true});
    var done = function(error, results) {
      logger.info('job_ready', results);
      this._socket.emit('job_ready', results);
      this._available();
    };
    this._job_execute(data, done.bind(this));
}
module.exports = Client;
