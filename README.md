# Local Music Bot v0.5.0
A Discord Bot for Local Music with library and role management.

## Requirements
- Node.js (>v5.0.0)
- Python (v2.7.x)
- FFmpeg (Add bin folder to PATH Environment Variable)

## Installation
1. Download the repository with git clone or some other method to a directory.
2. Open a command prompt/terminal at the directory.
3. Run npm install
4. Set the configuration in the config.json file.
5. Run npm start

## Config
- prefix: The prefix the bot uses. [Required]
- owner: The owner's Discord ID. [Required]
- token: Your bot's token. If not provided defaults to email and password. [Optional]
- email: Your bot's email. Optional if token provided. [Required/Optional]
- password: Your bot's password. Optional if token provided. [Required/Optional]
- libraryName: Name of your startup library. [Required]
- libraryPath: Path to your startup library. Use /. [Required]
- allowedChannels: Array of channel IDs which the bot will listen to. [Required]

## Perm Progress
- [x] search - Search with query.
- [x] queue - Add query result to queue.
- [x] join - Join voice channel if not already in one.
- [x] leave - Leave voice channel if in one.
- [ ] skip - Able to skip song. Need to implement voting.
- [x] current - Displays info on currently playing song.
- [x] list - Displays info on currently playing song and queue.
- [ ] unqueue - TODO Remove song/s from queue.
- [x] shuffle - Shuffle queue.
- [x] update
    * [x] library - Update the library.
    * [x] schedule - Update the library update interval.
- [ ] role
    * [x] view - View own role.
    * [ ] add - Add a new role.
    * [ ] delete - Delete a role.
    * [ ] edit - Modify a role.
    * [ ] default - Able to view default role. Unable to set default role.
    * [x] list - List roles.
    * [x] set - Set role of users @mentioned.
- [ ] library
    * [x] view - View name and path of selected library.
    * [ ] add - Add a new library.
    * [ ] delete - Delete a library.
    * [ ] edit - Modify a library.
    * [ ] select - Select a library.
    * [ ] list - List library names.
- [ ] playlist
    * [ ] list - List playlists saved.
    * [ ] view - View songs in playlists.
    * [ ] save - Save current song and queue as playlist.
    * [ ] load - Load a playlist into the queue.
    * [ ] delete - Delete a playlist.

## TODO
- Complete Perm Progress.
- Handle moved, modified, and deleted files.
- Prettify the messages.
- Create docs on command usage.