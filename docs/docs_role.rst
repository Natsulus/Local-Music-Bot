Role
====

Keys
~~~~

ID
--

| The numbered position of the role in the hiearchy. The lower the number, the higher the hierarchical position with #0 reserved for the Owner.
| This must be unique.
Name
----

| Name of the Role.
| This must be unique.
Description
-----------

| A description of the role.
Perm
----

| An array/list of :ref:`perms` the role has.
Default
-------

| Only one role has the value of this key as true at one time.
| Role with this key as true is the default role a new user gets assigned to.
Provided Roles
~~~~~~~~~~~~~~

The following roles come with the bot:

Owner
-----

| ID: 0
| Description: The Owner of the bot.
| Perm: Code bypasses perm requirements.
| Default: false
Partner
-------

| ID: 1
| Description: A user the Owner can absolutely trust.
| Perm: query, voice, view, queue, role, library.view, library.mod.select, library.update, playlist
| Default: false
Admin
-----

| ID: 3
| Description: A user who moderates other users.
| Perm: query, voice, view, queue, role.view, role.mod, role.default.view, library.view, library.mod.select, library.update, playlist
| Default: false
Moderator
---------

| ID: 5
| Description: A user who assists with moderating other users.
| Perm: query, voice, view, queue, role.view, role.mod.set, library.view.active, library.update.data.active, playlist.view, playlist.save, playlist.load, playlist.delete.own
| Default: false
Listener
--------

| ID: 8
| Description: A user who uses the bot.
| Perm: query, voice, view, queue.shuffle, queue.skip.vote, role.view.own, playlist.view, playlist.save, playlist.load, playlist.delete.own
| Default: false
Member
------

| ID: 10
| Description: A normal user.
| Perm: query.search, view.current, view.list
| Default: true