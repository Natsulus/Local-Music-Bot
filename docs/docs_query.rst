.. _query:

Query
=====

Options
-------

============ =====================================
Query        Details
============ =====================================
title        Case-Insensitive & Partial Matching
album        Case-Insensitive & Partial Matching
artist       Case-Insensitive & Partial Matching
allbumartist Case-Insensitive & Partial Matching
filename     Case-Insensitive & Partial Matching
duration     Number for amount of seconds. Negative for *shorter than*, Positive for *longer than*.
page         Number. Results are limited to 20 per page.
track        Number or Range.
sortby       none, title, album, artist, albumartist, filename, duration. Sorts in ascending order, add - in front for descending.
random       Provide any value to get a random song based on other query values except page, track and sortby.
============ =====================================

Examples
--------

Search for songs with artist SomeArtist, album SomeAlbum, getting results 21-40 (Page 2) when sorted by title then album in ascending order,then artist in descending order:

``>search artist: SomeArtist album: SomeAlbum page: 2 sortby: title album -artist``

Search for songs with album SomeAlbum with a duration shorter than 420 seconds:

``>search album: SomeAlbum duration: -420``

Search for songs with album SongAlbum and select track #5:

``>search album: SomeAlbum track: 5``

Search for songs with artist Space Artist and select track 3-8 when not sorted:

``>search artist: Space Artist track: 3-8 sortby: none``

Search for a random song from songs with album SongAlbum:

``>search album: SomeAlbum random: Anything Can Be Put For Random's Value But There Must Be Something``

Search for a random song from the library:

``>search random: asdf``

Notes
-----

- If no sortby value is provided it defaults to the sortby value: ``album artist albumartist title filename``