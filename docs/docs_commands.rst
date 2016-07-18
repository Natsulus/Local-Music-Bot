Commands
========

Query
~~~~~

search `Query`
--------------

| Perm: *query.search*
| Aliases: find

Searches for songs based on a :ref:`query` and returns a song or list.

queue `Query`
-------------

| Perm: *query.queue*
| Aliases: insert, q

Searches for songs based on a :ref:`query` and queues a song or list.

Voice
~~~~~

join `ChannelName`
------------------

| Perm: *voice.join*
| Aliases: 

Joins a voice channel if not already in one. ChannelName is case-insensitive and provides partial matching.

leave
-----

| Perm: *voice.leave*
| Aliases: 

Leaves a voice channel if connected to one.

View
~~~~

current
-------

| Perm: *view.current*
| Aliases: playing, song

Provides detail about the song currently playing.

list
----

| Perm: *view.list*
| Aliases: songs

Lists all songs in queue as well as the song currently playing.

cover
-----

| Perm: *view.cover*
| Aliases: art, artwork, albumart, image

Get the album art of the current song if available.

Queue
~~~~~

autoplay `on` | `off` | `status`
--------------------------------------

| Perm: *role.mod.add*
| Aliases: auto, ap

Enables or disables autoplay.

unqueue `NumberOrRange`
-----------------------

| Perm: *queue.remove*
| Aliases: remove

Removes the track/s from the queue at the provided Number/Range.

shuffle
-------

| Perm: *queue.shuffle*
| Aliases: randomise, randomize

Shuffles the queue.

skip
----

| Perm: *queue.skip.novote*
| Aliases: next

Skips current song.

skip vote
---------

| Perm: *queue.skip.vote*
| Aliases: next

Calls a vote to skip a song if no vote has started, else adds to vote to skip song.

Role
~~~~

role
----

| Perm: *role.view.own*
| Aliases: r

View details about own role.

role `User#Tag`
---------------

| Perm: *role.view.other*
| Aliases: r

View details about the role of User#Tag.

role view `ID`
--------------

| Perm: *role.view.detail*
| Aliases: r

View details about specified role.

role list
---------

| Perm: *role.view.list*
| Aliases: r

Lists all roles with their ID and Name.

role add `ID` | `Name` | `Description`
--------------------------------------

| Perm: *role.mod.add*
| Aliases: r

Adds a new role. Description is optional.

role delete `ID`
----------------

| Perm: *role.mod.delete*
| Aliases: r

Deletes the role with the specified role. All users with the deleted role will have their role set to the default role.

role edit `ID` | `Key` | `Value`
--------------------------------

| Perm: *role.mod.edit*
| Aliases: r

Edits the key for the specified role with the value. Cannot edit the keys Perm or Default.

role set `ID` `User#Tag`
------------------------

| Perm: *role.mod.set*
| Aliases: r

Sets the role of User#Tag with the specified role. Can enter multiple User#Tag, separated by ``" | "``. e.g. ``>role set 5 Bob#1234 | Fred#0420 | Tim#000``

role default
------------

| Perm: *role.default.view*
| Aliases: r

View details on the default role.

role default `ID`
-----------------

| Perm: *role.default.set*
| Aliases: r

Sets the default role to the specified role. ID must be greater than 5.

role give `ID` `Perm`
---------------------

| Perm: *role.perm.give*
| Aliases: r

Gives the specified role the specified Perm. Can enter multiple perm, separated by a space. e.g. ``>role give 5 role.default.view role.view playlist``

role remove `ID` `Perm`
-----------------------

| Perm: *role.perm.remove*
| Aliases: r

Removes the specified Perm from the specified role. Can enter multiple perm, separated by a space. e.g. ``>role remove 5 role.default.view role.view playlist``

Library
~~~~~~~

library
-------

| Perm: *library.view.active*
| Aliases: lib

View details of the active library.

library `Name`
--------------

| Perm: *library.view.detail*
| Aliases: lib
View details of specified library.

library list
------------

| Perm: *library.view.list*
| Aliases: lib
View list of libraries.

library add `Name` | `Path` | `Description`
-------------------------------------------

| Perm: *library.mod.add*
| Aliases: lib
Add a new library. Description is optional.

library delete `Name`
---------------------

| Perm: *library.mod.delete*
| Aliases: lib
Deletes the library with the specified Name.

library edit `Name` | `Key` | `Value`
-------------------------------------

| Perm: *library.mod.edit*
| Aliases: lib
Edits the key for the library with the specified Name with the value. Cannot edit the key Active.

library select `Name`
---------------------

| Perm: *library.mod.select*
| Aliases: lib
Selects the specified library as the active library.

update
------

| Perm: *library.update.active*
| Aliases: 
Check active library for any changes and updates the library.

update `LibraryName`
--------------------

| Perm: *library.update.other*
| Aliases: 
Check specified library for any changes and updates the library.

Playlist
~~~~~~~~

playlist `Name`
---------------

| Perm: *playlist.view.detail*
| Aliases: pl
Lists all songs in the specified playlist.

playlist list
-------------

| Perm: *playlist.view.list*
| Aliases: pl
Lists all playlist names.

playlist save `Name`
--------------------

| Perm: *playlist.save*
| Aliases: pl
Save the current song and queue as a playlist with the specified name.

playlist load `Name`
--------------------

| Perm: *playlist.load*
| Aliases: pl
Load the specified playlist into the queue.

playlist delete `Name`
----------------------

| Perm: *playlist.delete.own* | *playlist.delete.other*
| Aliases: pl
Deletes the specified playlist if you created it and have *playlist.delete.own* perm.

Deletes the specified playlist if you didn't create it and have *playlist.delete.other* perm.
