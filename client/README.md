OpenTMI job executor


Usage Example:
```
var Client = require('../');

var executor = function(job, done) {
    // execute the Job. After it's ready call done:
    done(null, {
      job: job, 
      success: true, 
      results: 'asd'
    });
};

var client = new Client({executor: executor});
client
  .addCapability('ls');
  .connect();
```