'use strict';
const walk = require('walk');
const Path = require('path');
const mm = require('musicmetadata');
const fs = require('fs');
const NeDB = require('nedb');
const fsmonitor = require('fsmonitor');
const async = require('async');

const acceptedExt = ['.mp3', '.m4a', '.ogg', '.flac', '.wma'];

class LibraryManager {
    constructor(library, channel) {
        this.library = library;
        this.db = new NeDB({filename: `./libraries/${library.name}.db`, autoload: true});
        this.db.ensureIndex({fieldName: 'filePath', unique: true});

        this.updateLibrary(channel);

        if (!channel) {
            this.monitor = fsmonitor.watch(this.library.path);
            this.monitor.on('change', change => {
                for (const added of change.addedFiles) {
                    const fileExt = Path.extname(added);

                    if (acceptedExt.indexOf(fileExt) !== -1) {
                        const filePath = Path.resolve(this.library.path, added);

                        this.db.findOne({filePath}, (err, doc) => {
                            if (err) console.log(err);
                            if (!doc) {
                                const fileName = Path.basename(added, fileExt);

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
                                });
                            }
                        });
                    }
                }
                for (const modified of change.modifiedFiles) {
                    const fileExt = Path.extname(modified);

                    if (acceptedExt.indexOf(fileExt) !== -1) {
                        const filePath = Path.resolve(this.library.path, modified);
                        const fileName = Path.basename(modified, fileExt);

                        mm(fs.createReadStream(filePath), {duration: true}, (err, meta) => {
                            if (err) console.log(err);
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
                            this.db.update({filePath}, file, {upsert: true});
                        });
                    }
                }
                for (const removed of change.removedFiles) {
                    const fileExt = Path.extname(removed);

                    if (acceptedExt.indexOf(fileExt) !== -1) {
                        const filePath = Path.resolve(this.library.path, removed);

                        this.db.remove({filePath}, {});
                    }
                }
            });
        }
    }

    updateLibrary(channel) {
        if (channel) channel.sendMessage(`Now updating the ${this.library.name} Library`);
        else console.log(`Now updating the ${this.library.name} Library`);

        let calls = [];

        this.db.find({}, (err, files) => {
            files.forEach(file => {
                calls.push(cb => {
                    fs.access(Path.resolve(file.filePath), err => {
                        if (err || !Path.resolve(file.filePath).startsWith(Path.resolve(this.library.path))) {
                            this.db.remove({fileName: file.fileName}, {}, (err2) => {
                                if (err2) cb(err2);
                                cb(null);
                            });
                        } else {
                            cb(null);
                        }
                    });
                });
            });

            async.parallel(calls, (err) => {
                if (err) console.log(err);
                const walker = walk.walk(this.library.path, {followLinks: false});

                walker.on("file", (root, stat, next) => {
                    const fileExt = Path.extname(stat.name);

                    if (acceptedExt.indexOf(fileExt) === -1) {
                        next();
                    } else {
                        const filePath = Path.resolve(root, stat.name);

                        this.db.findOne({filePath}, (err, doc) => {
                            if (err) console.log(err);
                            if (!doc) {
                                const fileName = Path.basename(stat.name, fileExt);

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
            });
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