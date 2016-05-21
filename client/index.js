var io = require('socket.io-client');

var socket = io.connect('http://localhost:3000/scheduler');

console.log('connecting..');

var client = {id: 'clientX'};

socket.on('connect', function() {
  console.log('connected. send register_request');
  
  var register_response =  function(data) {
    
    var available = function() {
      console.log('Im available..let server to know it..')
      socket.emit('available', {});
      socket.once('job_request', job_request);
    }
    
    var job_request = function(data, job_response) {
      console.log('job_request', data);
      job_response({accept: true});
      execute(data, function(error, results) {
        console.log('job_ready', results);
        socket.emit('job_ready', results);
        available();
      });
    }
    available();
  };
  var execute = function(job, cb) {
    console.log('Executing job:', job)
    setTimeout( function() {
        var data = {jobid: job.id, success: true, results: 'yeah..'};
        cb(null, data);
      }, job.duration*1000);
  }

  socket.emit('register_request', client);
  socket.once('register_response', register_response);

});