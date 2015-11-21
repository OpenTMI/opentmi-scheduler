
function AddonTaskScheduler (app, server, io, passport){

  this.name = 'scheduler addon';
  this.description = 'Schedule tasks';

  this.register = function(){

    var Schedule = require('schedulejs');

    app.get('/scheduler', function(req, res){

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

      var schedule = Schedule.create(tasks, resources, null, new Date());
      res.json(schedule);
    });
  }
  return this;
}

exports = module.exports = AddonTaskScheduler;