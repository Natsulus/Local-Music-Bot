'use strict';

exports.command = 'playlist';

exports.aliases = ['pl'];

exports.execute = function (data, cm) {
    let args = data.args.split(' ');
    const cmd = args.shift();
    let reply = '';

    args = args.join(' ');

    if (cmd === 'list') {
        cm.perms.check(data.m.author.id, 'playlist.view.list', allow => {
            if (!allow) return;
            cm.db.playlists.find({}, (err, playlists) => {
                if (playlists.length > 0) {
                    reply = '**Playlists**';
                    for (const playlist of playlists) {
                        reply += `\n${playlist.name}`;
                    }
                } else {
                    reply += 'Currently no playlists saved.';
                }
                data.m.channel.sendMessage(reply);
            });
        });
    } else if (cmd === 'save') {
        cm.perms.check(data.m.author.id, 'playlist.save', allow => {
            if (!allow) return;
            if (args !== '') {
                if (cm.music.queue.length > 0) {
                    let name = args;

                    cm.db.playlists.count({name}, (err, count) => {
                        if (count === 1) {
                            reply += `Playlist with the name ${name} already exists.`;
                        } else {
                            let owner = data.m.author.id;
                            let playlist = [cm.music.current].concat(cm.music.queue);

                            for (const song of playlist) {
                                delete song.channel;
                            }

                            cm.db.playlists.insert({name, owner, playlist});
                            reply += `Saved playlist ${name}.`;
                        }
                        data.m.channel.sendMessage(reply);
                    });
                }
            }
        });
    } else if (cmd === 'load') {
        cm.perms.check(data.m.author.id, 'playlist.load', allow => {
            if (!allow) return;
            if (args !== '') {
                if (cm.bot.voiceConnection) {
                    let name = args;

                    cm.db.playlists.findOne({name}, (err, playlist) => {
                        if (playlist) {
                            for (const song of playlist.playlist) {
                                song.channel = data.m.channel;
                                cm.music.queue.push(song);
                            }
                            cm.music.play();
                            reply += `Loaded playlist ${name}.`;
                        } else {
                            reply += `Playlist ${name} does not exist.`;
                        }
                        data.m.channel.sendMessage(reply);
                    });
                } else {
                    data.m.channel.sendMessage('Must be connected to a voice channel.');
                }
            }
        });
    } else if (cmd === 'delete') {
        if (args !== '') {
            let name = args;
            let owner = data.m.author.id;

            cm.db.playlists.count({name}, (err, pl) => {
                if (pl === 1) {
                    cm.db.playlists.count({name, owner}, (err, count) => {
                        if (count === 1) {
                            cm.perms.check(data.m.author.id, 'playlist.delete.own', allow => {
                                if (!allow) {
                                    data.m.channel.sendMessage(`You do not have permission to delete this playlist.`);
                                } else {
                                    cm.db.playlists.remove({name, owner});
                                    data.m.channel.sendMessage(`Playlist ${name} has been deleted.`);
                                }
                            });
                        } else {
                            cm.perms.check(data.m.author.id, 'playlist.delete.other', allow => {
                                if (!allow) {
                                    data.m.channel.sendMessage(`You do not have permission to delete this playlist.`);
                                } else {
                                    cm.db.playlists.remove({name});
                                    data.m.channel.sendMessage(`Playlist ${name} has been deleted.`);
                                }
                            });
                        }
                    });
                } else {
                    data.m.channel.sendMessage(`Playlist ${name} does not exist.`);
                }
            });
        }
    } else {
        cm.perms.check(data.m.author.id, 'playlist.view.detail', allow => {
            if (!allow) return;
            if (data.args !== '') {
                let name = data.args;

                cm.db.playlists.findOne({name}, (err, playlist) => {
                    if (playlist) {
                        let user = cm.bot.users.get('id', playlist.owner).name;
                        let i = 0;
                        reply += `**${name}**\nOwner: ${user}\nSongs:`;

                        for (const song of playlist.playlist) {
                            i++;
                            reply += `\n${i}. ${song.title ? song.title : song.fileName} [${song.duration}]`;
                        }
                    } else {
                        reply += `Playlist ${name} does not exist.`;
                    }
                    data.m.channel.sendMessage(reply);
                });
            }
        });
    }
};