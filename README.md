# Job Scheduler for OpenTMI.

Scheduler provide socketio API for "executors" which run some jobs, e.g. test job.

**.. NOT IMPLEMENTED ..**


# Protocol

```
SCHEDULER                   CLIENT
  socketio url: "<host>/scheduler"

  <-- connect           ---  socket.io:connect -event
  <-- register(data, cb)---  client details
  --- cb(error)         -->  denied if error exists, otherwise accepted
------------------------------
  <--  available        ---  available for jobs
  ---  job(data, cb)     -->  host request to execute job
  <--  cb(error)        ---  client can denied job by giving error
  <--  job_status       ---  NA
  <--  job_ready        ---  when execution finished..
------------------------------
```

register data:
```
{
  id: <client-id>,
  capabilities: [
    { id: <id> }
  ],
  ..
}
```

REST api:
```
/api/v0/scheduler/tasks
/api/v0/scheduler/clients
```