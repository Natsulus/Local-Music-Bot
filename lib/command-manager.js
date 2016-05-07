'use strict';
const path = require("path");
const LibraryManager = require('./library-manager.js');
const PermManager = require('./perm-manager.js');
const MusicManager = require('./music-manager.js');
const commands = require("require-all")({filter: /(.+)\.js$/, recursive: false, dirname: path.join(__dirname, "../commands")});

class CommandManager {
    constructor(bot, db) {
        this.db = db;
        this.perms = new PermManager(db);
        this.bot = bot;
        this.lib = null;
        db.libraries.findOne({active: true}, (err, library) => {
            if (library) {
                this.lib = new LibraryManager({name: library.name, path: library.path, description: library.description});
            }
        });
        this.music = new MusicManager(bot);
    }
    parse(m) {
        let args = m.content.split(' ');
        const mCommand = args.shift();

        args = args.join(' ');
        for (const cmd in commands) {
            if (commands[cmd].command === mCommand || commands[cmd].aliases.indexOf(mCommand) !== -1) {
                const data = {
                    args,
                    m
                };

                commands[cmd].execute(data, this, {processQuery, digitalTime, checkInteger});
                return;
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

    for (let i = 0; i < arr.length; i += 2) {
        if (validQuery.indexOf(arr[i].toLowerCase()) !== -1) obj[arr[i].toLowerCase()] = checkInteger(arr[i + 1], true);
        else return false;
    }

    const query = {};
    let sort = {};

    if (obj.title) query.title = new RegExp(`.*${obj.title}.*`, 'i');
    if (obj.album) query.album = new RegExp(`.*${obj.album}.*`, 'i');
    if (obj.artist) query.artist = new RegExp(`.*${obj.artist}.*`, 'i');
    if (obj.albumartist) query.albumArtist = new RegExp(`.*${obj.albumartist}.*`, 'i');
    if (checkInteger(obj.duration)) {
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

            if (checkInteger(split[0])) track.start = Number(split[0]);
            else return false;
            if (checkInteger(split[1])) track.end = Number(split[1]);
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

    if (!checkInteger(page)) return false;

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
        sort = {album: 1, artist: 1, albumArtist: 1, title: 1, fileName: 1};
    }

    return {query, sort, random, page, track};
}

function pad(num) {
    return `0${num}`.slice(-2);
}
function digitalTime(secs) {
    let minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    const hours = Math.floor(minutes / 60);

    minutes %= 60;
    if (hours === 0) return `${minutes}:${pad(seconds)}`;
    else return `${hours}:${pad(minutes)}:${pad(seconds)}`;
}

function checkInteger(str, ret) {
    if (ret) {
        if (Number.isInteger(Number(str))) return Number(str);
        return str;
    } else {
        return Number.isInteger(Number(str));
    }
}

module.exports = CommandManager;