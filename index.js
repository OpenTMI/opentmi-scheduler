var express = require('express');
var nconf = require('nconf');
var winston = require('winston');
var _ = require('underscore');
var async = require('async');

//var Schedule = require('schedulejs');



function AddonTaskScheduler (app, server, io, passport){

  var self = this;
  this.name = 'scheduler addon';
  this.description = 'Schedule tasks';
  var clients = {};

  var next_job = function(client, cb) {

    var tasks = [
      {id:1, duration: 30, resources: ['A']},
      {id:2, duration: 60, resources: ['B']},
      {id:3, duration: 60, resources: [['B', 'D'], 'A']}
    ];
    var resources = [
      {id: 'A'},
      {id: 'B'},
      {id: 'C'},
      {id: 'D'}
    ];

    //var schedule = Schedule.create(tasks, resources, null, new Date());
    //res.json(schedule);
    cb(null, tasks[0]);
  };
  var task_accepted = function(client, accept) {

  };

  this.register = function(){
    self.nsp = io.of('/scheduler'); 
    self.nsp.on('connection', connection);

    /*app.get('/scheduler/clients', function(req, res){
        res.status(200).json(clients);
    });*/
  }
  var getClient = function(socketid) {
    return _.find(clients, {socketid: socketid});
  }

  var connection = function(socket){
    console.log('client connected, wait for register request');
    //bind events 
    socket.on('register_request', register_request.bind(socket));
    socket.on('disconnect', disconnect.bind(socket));
  };
  var register_request = function(data) {
    var socket = this;
    console.log('register_request:', data);
    clients[data.id] = {
      id: data.id,
      socketid: socket.id, 
      registered: true
    };
    var client = getClient(socket.id); 
    socket.on('unregister', unregister.bind(this));
    socket.on('available', available.bind(this));
    socket.on('busy', busy.bind(this));
    socket.emit('register_response', clients[data.id]);
  }
  var unregister = function(data) {
    var socket = this;
    getClient(socket.id).registered = false;
  }
  var available = function(data) {
    var socket = this;
    var client = getClient(socket.id);
    console.log('find next job for client '+client.id);
    next_job(client, function(error, job){
      if(job) {
        console.log('request job to be executed by client '+ client.id);
        socket.emit('job_request', job, job_response.bind(this));
      }
    }.bind(this));
  }
  var job_response = function(data) {
    var socket = this;
    if(data.accept) {
      var client = getClient(socket.id); 
      task_accepted.bind(client)(data);
    }
  }
  var busy = function(data) {
    console.log('client busy:', data)
  }
  var disconnect = function(data) {
    var socket = this;
    var client = getClient(socket.id);
    if(client) {
      client.connected = false;
    }
  }

  return this;
}

exports = module.exports = AddonTaskScheduler;