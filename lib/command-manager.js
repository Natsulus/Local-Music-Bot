'use strict';
const LibraryManager = require('./library-manager.js');
const PermManager = require('./perm-manager.js');
const MusicManager = require('./music-manager.js');

class CommandManager {
    constructor(bot, config, db) {
        this.db = db;
        this.perms = new PermManager(db);
        this.bot = bot;
        this.prefix = config.prefix;
        this.lib = new LibraryManager({name: config.libraryName, path: config.libraryPath});
        this.allowedChannels = config.allowedChannels;
        this.music = new MusicManager(bot);
    }
    parse(m) {
        if (this.allowedChannels.indexOf(m.channel.id) !== -1) {
            if (m.content.startsWith(this.prefix)) {
                const mes = m.content.substring(this.prefix.length);
                let args = mes.split(' ');
                const command = args.shift();
                let qry = {};
                let reply = '';
                let length;

                args = args.join(' ');

                if (command === 'search') {
                    this.perms.check(m.author.id, 'search', allow => {
                        if (!allow) return;
                        qry = processQuery(args);
                        if (!qry) return;

                        if (qry.random) {
                            this.lib.searchLibraryRandom(qry.query, song => {
                                length = hmmss(song.duration);
                                reply += `${song.title ? song.title : song.fileName}`;
                                reply += song.artist ? ` by ${song.artist}` : ``;
                                reply += song.album ? ` from ${song.album}` : ``;
                                reply += ` [${length}]`;
                                m.channel.sendMessage(reply);
                            });
                        } else {
                            if (qry.track) {
                                if (isNaN(qry.track)) {
                                    this.lib.searchRange(qry.query, qry.sort, qry.track, list => {
                                        let songNo = qry.track.start;

                                        for (const song of list) {
                                            songNo++;
                                            length = hmmss(song.duration);
                                            reply += `\n${songNo}. `;
                                            reply += `${song.title ? song.title : song.fileName}`;
                                            reply += song.artist ? ` by ${song.artist}` : ``;
                                            reply += song.album ? ` from ${song.album}` : ``;
                                            reply += ` [${length}]`;
                                        }
                                        m.channel.sendMessage(reply);
                                    });
                                } else {
                                    this.lib.searchTrack(qry.query, qry.sort, qry.track, song => {
                                        length = hmmss(song.duration);
                                        reply += `${qry.track}. `;
                                        reply += `${song.title ? song.title : song.fileName}`;
                                        reply += song.artist ? ` by ${song.artist}` : ``;
                                        reply += song.album ? ` from ${song.album}` : ``;
                                        reply += ` [${length}]`;
                                        m.channel.sendMessage(reply);
                                    });
                                }
                            } else {
                                this.lib.searchLibrary(qry.query, qry.sort, qry.page, list => {
                                    let songNo = qry.page;

                                    for (const song of list) {
                                        songNo++;
                                        length = hmmss(song.duration);
                                        reply += `\n${songNo}. `;
                                        reply += `${song.title ? song.title : song.fileName}`;
                                        reply += song.artist ? ` by ${song.artist}` : ``;
                                        reply += song.album ? ` from ${song.album}` : ``;
                                        reply += ` [${length}]`;
                                    }
                                    m.channel.sendMessage(reply);
                                });
                            }
                        }
                    });
                } else if (command === 'list') {
                    this.perms.check(m.author.id, 'list', allow => {
                        if (!allow) return;
                        if (this.music.current) {
                            const played = hmmss(Math.floor(this.bot.voiceConnection.streamTime / 1000));

                            reply += `Currently Playing ${this.music.current.title} [${played}/${this.music.current.duration}]`;
                            if (this.music.queue.length > 0) {
                                let i = 0;

                                for (const song of this.music.queue) {
                                    i++;
                                    reply += `\n${i}. ${song.title} [${song.duration}]`;
                                }
                            }
                            m.channel.sendMessage(reply);
                        }
                    });
                } else if (command === 'current') {
                    this.perms.check(m.author.id, 'current', allow => {
                        if (!allow) return;
                        if (this.music.current) {
                            const played = hmmss(Math.floor(this.bot.voiceConnection.streamTime / 1000));

                            reply += `Currently Playing ${this.music.current.title} [${played}/${this.music.current.duration}]`;
                            m.channel.sendMessage(reply);
                        }
                    });
                } else if (command === 'queue') {
                    this.perms.check(m.author.id, 'queue', allow => {
                        if (!allow) return;
                        if (!this.bot.voiceConnection) return;
                        qry = processQuery(args);
                        if (!qry) return;

                        if (qry.random) {
                            this.lib.searchLibraryRandom(qry.query, song => {
                                song.duration = hmmss(Math.round(song.duration));
                                song.channel = m.channel;
                                this.music.queue.push(song);
                                reply += `Added `;
                                reply += `${song.title ? song.title : song.fileName}`;
                                reply += song.artist ? ` by ${song.artist}` : ``;
                                reply += song.album ? ` from ${song.album}` : ``;
                                reply += ` to the queue.`;
                                this.music.play();
                                m.channel.sendMessage(reply);
                            });
                        } else {
                            if (qry.track) {
                                if (isNaN(qry.track)) {
                                    this.lib.searchRange(qry.query, qry.sort, qry.track, list => {
                                        for (const song of list) {
                                            song.duration = hmmss(Math.round(song.duration));
                                            song.channel = m.channel;
                                            this.music.queue.push(song);
                                        }
                                        reply += `Added ${list.length} songs to the queue.`;
                                        this.music.play();
                                        m.channel.sendMessage(reply);
                                    });
                                } else {
                                    this.lib.searchTrack(qry.query, qry.sort, qry.track, song => {
                                        song.duration = hmmss(Math.round(song.duration));
                                        song.channel = m.channel;
                                        this.music.queue.push(song);
                                        reply += `Added `;
                                        reply += `${song.title ? song.title : song.fileName}`;
                                        reply += song.artist ? ` by ${song.artist}` : ``;
                                        reply += song.album ? ` from ${song.album}` : ``;
                                        reply += ` to the queue.`;
                                        this.music.play();
                                        m.channel.sendMessage(reply);
                                    });
                                }
                            } else {
                                this.lib.searchLibrary(qry.query, qry.sort, qry.page, list => {
                                    for (const song of list) {
                                        song.duration = hmmss(Math.round(song.duration));
                                        song.channel = m.channel;
                                        this.music.queue.push(song);
                                    }
                                    reply += `Added ${list.length} songs to the queue.`;
                                    this.music.play();
                                    m.channel.sendMessage(reply);
                                });
                            }
                        }
                    });
                } else if (command === 'join') {
                    this.perms.check(m.author.id, 'join', allow => {
                        if (!allow) return;
                        if (!this.bot.voiceConnection) {
                            const check = new RegExp(`.*${args}.*`, 'i');

                            for (const channel of m.channel.server.channels) {
                                if (channel.name.search(check) !== -1) {
                                    this.bot.joinVoiceChannel(channel);
                                    break;
                                }
                            }
                        }
                    });
                } else if (command === 'leave') {
                    this.perms.check(m.author.id, 'leave', allow => {
                        if (!allow) return;
                        if (this.bot.voiceConnection) {
                            this.music.current = null;
                            this.music.queue = [];
                            this.bot.leaveVoiceChannel(this.bot.voiceConnection.voiceChannel);
                        }
                    });
                } else if (command === 'skip') {
                    this.perms.check(m.author.id, 'skip', allow => {
                        if (!allow) return;
                        if (this.bot.voiceConnection) {
                            // need to implement voting
                            this.bot.voiceConnection.stopPlaying();
                        }
                    });
                } else if (command === 'unqueue') {
                    this.perms.check(m.author.id, 'unqueue', allow => {
                        if (!allow) return;
                        // stuff
                    });
                } else if (command === 'shuffle') {
                    this.perms.check(m.author.id, 'shuffle', allow => {
                        if (!allow) return;
                        this.music.shuffle();
                        reply += 'Queue has been shuffled.';
                        m.channel.sendMessage(reply);
                    });
                } else if (command === 'update') {
                    args = args.split(' ');
                    if (args[0] === 'schedule') {
                        this.perms.check(m.author.id, 'update.schedule', allow => {
                            if (!allow) return;
                            let num = checkNumber(args[1]);

                            if (!isNaN(num)) {
                                if (num > 0) {
                                    this.lib.setUpdateCheck(args[1]);
                                    m.channel.sendMessage(`Update Interval now set to ${args[1]} minutes.`);
                                } else {
                                    m.channel.sendMessage(`Number needs to be more than 0.`);
                                }
                            } else {
                                m.channel.sendMessage(`Requires a number for the Update Interval in minutes.`);
                            }
                        });
                    } else {
                        this.perms.check(m.author.id, 'update.library', allow => {
                            if (!allow) return;
                            this.lib.updateLibrary(m.channel);
                        });
                    }
                } else if (command === 'role') {
                    args = args.split(' ');
                    if (args[0] !== '') {
                        const subCommand = args.shift();

                        if (subCommand === 'add') {
                            this.perms.check(m.author.id, 'role.add', allow => {
                                if (!allow) return;
                                //
                            });
                        } else if (subCommand === 'edit') {
                            this.perms.check(m.author.id, 'role.edit', allow => {
                                if (!allow) return;
                                //
                            });
                        } else if (subCommand === 'delete') {
                            this.perms.check(m.author.id, 'role.delete', allow => {
                                if (!allow) return;
                                //
                            });
                        } else if (subCommand === 'default') {
                            this.perms.check(m.author.id, 'role.default', allow => {
                                if (!allow) return;
                                if (args.length > 0) {
                                    //
                                } else {
                                    this.db.roles.findOne({default: true}, (err, role) => {
                                        if (err) console.log(err);
                                        if (role) {
                                            reply += `#${role.id} ${role.name}`;
                                            if (role.perm) {
                                                reply += '\nPerms: ';
                                                for (const perm of role.perm) {
                                                    reply += `${perm}, `;
                                                }
                                                reply = reply.slice(0, -2);
                                            }
                                            m.channel.sendMessage(reply);
                                        }
                                    });
                                }
                            });
                        } else if (subCommand === 'list') {
                            this.perms.check(m.author.id, 'role.list', allow => {
                                if (!allow) return;
                                if (args.length > 0) {
                                    const name = args.join(' ');

                                    this.db.roles.findOne({name}, (err, role) => {
                                        if (err) console.log(err);
                                        reply += `#${role.id} ${role.name}`;
                                        if (role.perm) {
                                            reply += '\nPerms: ';
                                            for (const perm of role.perm) {
                                                reply += `${perm}, `;
                                            }
                                            reply = reply.slice(0, -2);
                                        }
                                        m.channel.sendMessage(reply);
                                    })
                                } else {
                                    this.db.roles.find({}).sort({id: 1}).exec((err, roles) => {
                                        if (err) console.log(err);
                                        reply += 'Roles: ';
                                        for (const role of roles) {
                                            reply += `\n#${role.id} ${role.name}`;
                                        }
                                        m.channel.sendMessage(reply);
                                    })
                                }
                            });
                        } else if (subCommand === 'set') {
                            this.perms.check(m.author.id, 'role.set', allow => {
                                if (!allow) return;
                                if (m.mentions.length > 0) {
                                    if (args[0] !== '') {
                                        this.db.users.findOne({id: m.author.id}, {role: 1}, (err, user) => {
                                            this.db.roles.findOne({name: args[0]}, {id: 1}, (err2, role) => {
                                                if (role) {
                                                    if (role.id > user.role) {
                                                        for (const mention of m.mentions) {
                                                            this.db.users.update({id: mention.id}, {$set: {role: role.id}}, () => {
                                                                m.channel.sendMessage(`Set ${mention.name}'s role to ${args[0]}`);
                                                            });
                                                        }
                                                    } else {
                                                        m.channel.sendMessage(`Insufficient permission.`);
                                                    }
                                                } else {
                                                    m.channel.sendMessage(`The role ${args[0]} does not exist.`);
                                                }
                                            });
                                        });
                                    }
                                }
                            });
                        }
                    } else {
                        this.perms.check(m.author.id, 'role.view', allow => {
                            if (!allow) return;
                            this.perms.getRole(m.author.id, (err, role) => {
                                if (err) return;
                                reply += `#${role.id} ${role.name}`;
                                if (role.perm) {
                                    reply += '\nPerms: ';
                                    for (const perm of role.perm) {
                                        reply += `${perm}, `;
                                    }
                                    reply = reply.slice(0, -2);
                                }
                                m.channel.sendMessage(reply);
                            });
                        });
                    }
                } else if (command === 'library') {
                    args = args.split(' ');
                    if (args[0] !== '') {
                        const subCommand = args.shift();

                        if (subCommand === 'add') {
                            this.perms.check(m.author.id, 'library.add', allow => {
                                if (!allow) return;
                                //
                            });
                        } else if (subCommand === 'edit') {
                            this.perms.check(m.author.id, 'library.edit', allow => {
                                if (!allow) return;
                                //
                            });
                        } else if (subCommand === 'delete') {
                            this.perms.check(m.author.id, 'library.delete', allow => {
                                if (!allow) return;
                                //
                            });
                        } else if (subCommand === 'select') {
                            this.perms.check(m.author.id, 'library.select', allow => {
                                if (!allow) return;
                                if (args.length > 0) {
                                    //
                                } else {
                                    //
                                }
                            });
                        } else if (subCommand === 'list') {
                            this.perms.check(m.author.id, 'library.list', allow => {
                                if (!allow) return;
                                //
                            });
                        }
                    } else {
                        this.perms.check(m.author.id, 'library.view', allow => {
                            if (!allow) return;
                            reply += `${this.lib.library.name}: ${this.lib.library.path}`;
                            m.channel.sendMessage(reply);
                        });
                    }
                } else if (command === 'playlist') {
                    args = args.split(' ');
                    if (args[0] !== '') {
                        const subCommand = args.shift();

                        if (subCommand === 'view') {
                            this.perms.check(m.author.id, 'playlist.view', allow => {
                                if (!allow) return;
                                //
                            });
                        } else if (subCommand === 'save') {
                            this.perms.check(m.author.id, 'playlist.save', allow => {
                                if (!allow) return;
                                //
                            });
                        } else if (subCommand === 'load') {
                            this.perms.check(m.author.id, 'playlist.load', allow => {
                                if (!allow) return;
                                //
                            });
                        } else if (subCommand === 'delete') {
                            this.perms.check(m.author.id, 'playlist.delete', allow => {
                                if (!allow) return;
                                //
                            });
                        }
                    } else {
                        this.perms.check(m.author.id, 'playlist.list', allow => {
                            if (!allow) return;
                            //
                        });
                    }
                }
            }
        }
    }
}

function processQuery(qry) {
    const validQuery = ['title', 'album', 'artist', 'duration', 'filename', 'page', 'track', 'sortby', 'albumartist', 'random'];
    const validSort = ['title', 'album', 'artist', 'duration', 'filename', 'albumartist'];

    qry = qry.split(': ');

    if (qry.length === 1) return false;

    const arr = [];
    const obj = {};

    arr.push(qry.shift());
    for (let i = 0; i < qry.length - 1; i++) {
        const val = qry[i].split(' ');
        const key = val.pop();

        arr.push(val.join(' '));
        arr.push(key);
    }
    arr.push(qry.pop());

    for (let i = 0; i < arr.length; i += 2)
        if (validQuery.indexOf(arr[i].toLowerCase()) !== -1) obj[arr[i].toLowerCase()] = checkNumber(arr[i + 1]);

    const query = {};
    let sort = {};

    if (obj.title) query.title = new RegExp(`.*${obj.title}.*`, 'i');
    if (obj.album) query.album = new RegExp(`.*${obj.album}.*`, 'i');
    if (obj.artist) query.artist = new RegExp(`.*${obj.artist}.*`, 'i');
    if (obj.albumartist) query.albumArtist = new RegExp(`.*${obj.albumartist}.*`, 'i');
    if (!isNaN(obj.duration)) {
        if (obj.duration > 0) query.duration = {$gte: obj.duration};
        else if (obj.duration < 0) query.duration = {$lte: obj.duration * -1};
    }
    if (obj.filename) query.fileName = new RegExp(`.*${obj.filename}.*`, 'i');

    const page = obj.page ? obj.page * 20 - 20 : 0;
    let track = null;

    if (obj.track) {
        if (isNaN(obj.track)) {
            track = {};
            const split = obj.track.split('-');

            if (Number(split[0])) track.start = Number(split[0]);
            else return false;
            if (Number(split[1])) track.end = Number(split[1]);
            else return false;
            if (track.start > track.end) {
                const temp = track.start;

                track.start = track.end;
                track.end = temp;
            }
            track.start--;
        } else {
            track = obj.track;
        }
    }

    if (isNaN(page)) return false;

    const random = obj.random ? obj.random : null;

    if (obj.sortby) {
        const sortArgs = obj.sortby.split(' ');

        if (sortArgs[0] !== 'none') {
            for (const sorter of sortArgs) {
                if (sorter[0] !== '-') {
                    if (validSort.indexOf(sorter.toLowerCase()) !== -1) {
                        if (sorter === 'filename') sort.fileName = 1;
                        else if (sorter === 'albumartist') sort.albumArtist = 1;
                        else sort[sorter] = 1;
                    }
                } else {
                    if (validSort.indexOf(sorter.toLowerCase()) !== -1) {
                        if (sorter.substring(1) === 'filename') sort.fileName = 1;
                        else if (sorter.substring(1) === 'albumartist') sort.albumArtist = 1;
                        else sort[sorter.substring(1)] = 1;
                    }
                }
            }
        }
    } else {
        sort = {album: 1, artist: 1, track: 1, title: 1, fileName: 1};
    }

    return {query, sort, random, page, track};
}

function pad(num) {
    return `0${num}`.slice(-2);
}
function hmmss(secs) {
    let minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    const hours = Math.floor(minutes / 60);

    minutes %= 60;
    if (hours === 0) return `${pad(minutes)}:${pad(seconds)}`;
    else return `${hours}:${pad(minutes)}:${pad(seconds)}`;
}

function checkNumber(str) {
    if (isNaN(str)) return str;
    return Number(str);
}
module.exports = CommandManager;