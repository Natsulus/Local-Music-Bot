Library
=======

Keys
~~~~

Name
----

| The name of the library. 
| This must be unique.
| 

Path
----

| The root path of the library. Paths should not use \ and should instead use /.
| This must be unique.
| 

Description
-----------

| A description of the library.
| 

Active
------

| Only one library has the value of this key as true at one time.
| Library with this key as true is the library that is currently being used.
| 

Notes
~~~~~

- New libraries will take a while to load depending on the size of the library and the disk's read speed as they must open each file to get their metadata.
- Libraries cannot detect files that were modified while the library was not active.