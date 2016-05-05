Config
======

.. _config-json:

config.json
-----------

prefix
    The prefix the bot uses.
owner
    The owner's Discord ID.
token
    Your bot's token. Defaults to email and password if not provided.
email
    Your bot's email. Optional if token provided.
password
    Your bot's password. Optional if token provided.
libraryName
    Name of your startup library.
libraryPath
    Path to your startup library. Use /.
allowedChannels
    Array of channel IDs which the bot will listen to. 
    
Example
-------

.. code-block:: json

    {
        "prefix": ">",
        "owner": "345678909876543",
        "token": "ABC123def987-zxyNOP546",
        "email": "",
        "password": "",
        "libraryName": "Music",
        "libraryPath": "C:/Users/Name/Music",
        "allowedChannels": ["23456789098765432", "23456789098765432", "23456789098765432"]
    }