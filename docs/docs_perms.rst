.. _perms:

Perms
=====

Perm List
---------

- query

  - search
  - queue

- voice

  - join
  - leave

- view

  - current
  - list
  - cover
  
- queue

  - remove
  - shuffle
  - skip

    - novote
    - vote
  
- role

  - view
  
    - own
    - other
    - detail
    - list

  - mod
  
    - add
    - delete
    - edit
    - set
    
  - default
  
    - view
    - set
    
  - perm
  
    - give
    - remove
  
- library

  - view
  
    - active
    - detail
    - list
    
  - mod
  
    - add
    - delete
    - edit
    - select
    
  - update
  
    - active
    - other

- playlist

  - view

    - detail
    - list

  - save
  - load
  - delete
  
    - own
    - other
	
Notes
-----
  
| Use dot notation to select sub perms. Selecting main perm will select all sub perms. 
| e.g. ``voice = voice.join & voice.leave``
| 