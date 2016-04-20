'use strict';
const walk = require('walk');
const path = require('path');
const mm = require('musicmetadata');
const fs = require('fs');
const schedule = require('node-schedule');
const Datastore = require('nedb');

const acceptedExt = ['.mp3', '.m4a', '.ogg', '.flac', '.wma'];

class LibraryManager {
    constructor(library) {
        this.library = library;
        this.db = new Datastore({filename: `./library/${library.name}.db`, autoload: true});
        this.db.ensureIndex({fieldName: 'filePath', unique: true});

        this.updateLibrary();
        this.setUpdateCheck('60');
    }

    setUpdateCheck(time) {
        this.updateCheck = schedule.scheduleJob(`*/${time} * * * *`, () => {
            this.updateLibrary();
        });
    }

    updateLibrary(channel) {
        if (channel) channel.sendMessage(`Now updating the ${this.library.name} Library`);
        else console.log(`Now updating the ${this.library.name} Library`);

        const walker = walk.walk(this.library.path, {followLinks: false});

        walker.on("file", (root, stat, next) => {
            const fileExt = path.extname(stat.name);

            if (acceptedExt.indexOf(fileExt) === -1) {
                next();
            } else {
                const filePath = path.resolve(root, stat.name);

                this.db.findOne({filePath}, (err, doc) => {
                    if (err) console.log(err);
                    if (!doc) {
                        const fileName = path.basename(stat.name, fileExt);

                        mm(fs.createReadStream(filePath), {duration: true}, (err2, meta) => {
                            if (err2) console.log(err2);
                            const file = {};

                            file.title = meta.title !== '' ? meta.title : null;
                            file.artist = meta.artist.length > 0 ? meta.artist[0] : null;
                            file.albumArtist = meta.albumartist.length > 0 ? meta.albumartist[0] : null;
                            file.album = meta.album !== '' ? meta.album : null;
                            file.duration = meta.duration;
                            file.track = meta.track.no !== 0 ? meta.track.no : null;
                            file.disk = meta.disk.no !== 0 ? meta.disk.no : null;
                            file.fileName = fileName;
                            file.fileExt = fileExt;
                            file.filePath = filePath;
                            this.db.insert(file);
                            next();
                        });
                    } else {
                        next();
                    }
                });
            }
        });
        walker.on("errors", (root, nodeStatsArray, next) => {
            nodeStatsArray.forEach(n => {
                console.error(`[ERROR] " ${n.name}`);
                console.error(n.error.message || `${n.error.code}: ${n.error.path}`);
            });
            next();
        });
        walker.on("end", () => {
            if (channel) channel.sendMessage(`Finished updating the ${this.library.name} Library`);
            else console.log(`Finished updating the ${this.library.name} Library`);
        });
    }

    searchLibrary(query, sort, page, cb) {
        this.db.find(query).sort(sort).skip(page).limit(20).exec((err, list) => {
            if (err) console.log(err);
            cb(list);
        });
    }

    searchLibraryRandom(query, cb) {
        this.db.count(query).exec((err, count) => {
            if (err) console.log(err);
            const r = Math.floor(Math.random() * count);

            this.db.findOne(query).skip(r).exec((err2, song) => {
                if (err2) console.log(err2);
                cb(song);
            });
        });
    }

    searchTrack(query, sort, track, cb) {
        this.db.findOne(query).sort(sort).skip(track - 1).limit(1).exec((err, song) => {
            if (err) console.log(err);
            cb(song);
        });
    }

    searchRange(query, sort, track, cb) {
        this.db.find(query).sort(sort).skip(track.start).limit(track.end - track.start).exec((err, list) => {
            if (err) console.log(err);
            cb(list);
        });
    }
}

module.exports = LibraryManager;