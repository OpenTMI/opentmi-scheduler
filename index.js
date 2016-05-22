var express = require('express');
var nconf = require('nconf');
var winston = require('winston');
var _ = require('lodash');
var async = require('async');
var Schedule = require('schedulejs');

var logger = {
  silly: console.log,
  debug: console.log,
  info: console.log,
  warn: console.log,
  error: console.log
};

//logger = winston;

function AddonTaskScheduler (app, server, io, passport){

    var self = this, clients = [];
    this.name = 'scheduler addon';
    this.description = 'Schedule tasks';
    var get_tasks = function () {
      return [
            {id:11, duration: 30, resources: ['A']},
            {id:22, duration: 60, resources: ['ls']},
            {id:33, duration: 60, resources: ['A']}
        ];
    };
    var get_client_resources = function (client) {
        /*var resources = [
          {id: 'A'},
          {id: 'B'},
          {id: 'C'},
          {id: 'D'}
        ];*/
        return client.capabilities;
    }
    var next_job = function (client, cb) {
        var tasks = get_tasks();
        var resources = get_client_resources(client);
        //logger.silly('client resources: ', resources);
        //logger.silly('tasks: ', tasks);
        //http://bunkat.github.io/schedule/
        
        console.log(tasks, resources);

        var schedule = Schedule.create(tasks, resources);
        logger.silly(JSON.stringify(schedule, null, 2))
        //cb(null, schedule[0]);
        
        var task = tasks[0];
        logger.silly('request task: ', task);
        cb(null, task);
    };
    var job_accepted = function (job, accept) {
        var client = this;
        client.process = job;
    };

    this.register = function () {
        self.nsp = io.of('/scheduler'); 
        self.nsp.on('connection', connection);
        io.on('error', function(error) {logger.error(error);});
        app.get('/api/v0/scheduler/clients', function(req, res){
            res.status(200).json(clients);
        });
        app.get('/api/v0/scheduler/tasks', function(req, res){
            var tasks = get_tasks();
            res.status(200).json(tasks);
        });
    }
    var getClient = function (id) {
        var client = _.find(clients, {socketid: id});
        if(client) return client;
        return _.find(clients, {id: id});
    };

    var connection = function (socket){
        logger.debug('client connected, wait for register request');
        //bind events 
        socket.on('register', register_request.bind(socket));
        socket.on('disconnect', disconnect.bind(socket));
        socket.on('error', function(error){logger.error(error);});
    };
    var disconnect = function() {
        logger.debug('client %s disconnected', this.id);
        var socket = this,
            client = getClient(socket.id);
        if (client) {
            client.connected = false;
        }
    };
    var register_request = function (data, cb) {
        console.log(cb);
        var socket = this;
        logger.info('register:', data);
        var client = getClient(data.id);
        if (!client) {
          client = _.extend(data, {
              id: data.id,
              socketid: socket.id
          });
          client.connected = true;
          clients.push(client);
        }
        socket.on('unregister', unregister.bind(this));
        socket.on('available', available.bind(socket));
        socket.on('job_ready', job_ready.bind(socket));
        cb(null, client); //accept
    };
    var unregister = function (data) {
        var socket = this;
        getClient(socket.id).registered = false;
    };
    var job_ready = function (error, data) {
      
      var socket = this;
      var client = getClient(socket.id);
      client.job = false;
      if( error ) {
        logger.error('job_ready: ', error);
      } else {
        logger.info('job_ready: ', data);
      }

    }
    var available = function (data) {
        var socket = this;
        var client = getClient(socket.id);
        if(!client) {
            socket.disconnect();
            return;
        }
        console.log(client);
        logger.silly('find next job for client %s', client.id);
        
        next_job(client, function (error, job){
            if(job) {
                var job_accept = function (data) {
                    logger.silly('job_accept', data);
                    if(data.accept) {
                        logger.debug("client accepted job: ", job);
                        job_accepted.bind(client)(job, data);
                    }
                };
                logger.debug('request job to be executed by client '+ client.id);
                socket.emit('job_request', job, job_accept);
            }
        }.bind(this));
    };

    return this;
}

exports = module.exports = AddonTaskScheduler;