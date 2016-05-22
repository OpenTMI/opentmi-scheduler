var fs = require('fs'),
    Client = require('../'),
    client,
    my_capabilities;

var my_executor = function (job, done) {
    console.log('press enter to finish job..');
    process.stdin.on('readable', () => {
        var chunk = process.stdin.read();
        if (chunk !== null) {
            //
            done(null,  //execution fatal errors, like invalid environments, problems with system
                 {
                    job: job,
                    success: true,
                    results: {
                        data: chunk.toString()
                    }
                 }
            );
        }
    });
};

my_capabilities = [
    {id: "ls"}
];

client = new Client({
    executor: my_executor,
    capabilities: my_capabilities
});

client.connect();
