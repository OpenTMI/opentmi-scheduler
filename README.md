# Job Scheduler for OpenTMI.

Scheduler provide socketio API for "executors" which run some jobs, e.g. test job.

**.. NOT IMPLEMENTED ..**

```
SCHEDULER                   CLIENT
  socketio url: "<host>/scheduler"

  <-- connect           ---
  <-- register_request  ---
  --- register_response -->
------------------------------
  <--  available        ---  available for jobs
  ---  job_request      -->  host request to execute job
  <--  job_response     ---  client can accept/denied job
  <--  job_ready        ---  when execution finished..
------------------------------
```

REST api:
```
/api/v0/scheduler/tasks
/api/v0/scheduler/clients
```