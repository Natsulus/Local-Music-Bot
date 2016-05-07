'use strict';
const Datastore = require('nedb');
const LibraryManager = require('../lib/library-manager.js');
const fs = require('fs');
const Path = require('path');

exports.command = 'library';

exports.aliases = ['lib'];

exports.execute = function (data, cm) {
    let args = data.args.split(' ');
    const cmd = args.shift();
    let reply = '';

    args = args.join(' ');

    if (cmd === 'list') {
        cm.perms.check(data.m.author.id, 'library.view.list', allow => {
            if (!allow) return;
            cm.db.libraries.find({}, (err, libraries) => {
                if (libraries.length > 0) {
                    reply += `**[Libraries]**`;
                    for (const library of libraries) {
                        reply += `\n${library.name}`;
                    }
                    data.m.channel.sendMessage(reply);
                }
            });
        });
    } else if (cmd === 'add') {
        cm.perms.check(data.m.author.id, 'library.mod.add', allow => {
            if (!allow) return;
            args = args.split(' | ');
            if (args.length > 1 && args.length < 4) {
                let name = args[0];
                let path = args[1];
                let description;

                if (args.length == 3) description = args[2];
                else description = '';

                fs.access(Path.resolve(path), err => {
                    if (err) {
                        reply += `Path does not exist or is inaccessible.`;
                        data.m.channel.sendMessage(reply);
                    } else {
                        cm.db.libraries.findOne({$or: [{name}, {path}]}, (err, lib) => {
                            if (!lib) {
                                cm.db.libraries.insert({name, path, description, active: false});
                                reply += `${name} Library has been created.`;
                                data.m.channel.sendMessage(reply);
                            } else {
                                reply += `A library with the same name and/or path already exists.`;
                                data.m.channel.sendMessage(reply);
                            }
                        });
                    }
                });
            } else {
                reply += `Invalid amount of parameters.`;
                data.m.channel.sendMessage(reply);
            }
        });
    } else if (cmd === 'delete') {
        cm.perms.check(data.m.author.id, 'library.mod.delete', allow => {
            if (!allow) return;
            let name = args;
            if (cm.lib) {
                if (cm.lib.library.name === name) {
                    reply += 'Deleting the active library.';
                    cm.lib = null;
                }
            }
            cm.db.libraries.remove({name}, {}, (err, count) => {
                if (count > 0) {
                    fs.unlinkSync(`./libraries/${name}.db`);
                    reply += `Deleted the ${name} Library.`;
                } else {
                    reply += `${name} Library does not exist.`;
                }
                data.m.channel.sendMessage(reply);
            });
        });
    } else if (cmd === 'edit') {
        cm.perms.check(data.m.author.id, 'library.mod.edit', allow => {
            if (!allow) return;
            args = args.split(' | ');
            if (args.length === 3) {
                let name = args[0];
                let key = args[1].toLowerCase();
                let value = args[2];

                if (key === 'active') return;
                cm.db.libraries.findOne({name}, (err, lib) => {
                    if (lib) {
                        switch (key) {
                            case 'name':
                                cm.db.libraries.findOne({name: value}, (err, dupe) => {
                                    if (!dupe) {
                                        cm.db.libraries.update({name}, {$set: {name: value}}, {}, () => {
                                            fs.renameSync(Path.resolve(`./libraries/${name}.db`), Path.resolve(`./libraries/${value}.db`));
                                            if (name === cm.lib.library.name) {
                                                cm.lib = new LibraryManager({name: value, path: lib.path, description: lib.description});
                                            }
                                            reply += `${name} Library has been renamed to ${value} Library.`;
                                            data.m.channel.sendMessage(reply);
                                        });
                                    } else {
                                        reply += `Library with the same name already exists.`;
                                        data.m.channel.sendMessage(reply);
                                    }
                                });
                                break;
                            case 'path':
                                cm.db.libraries.findOne({path: value}, (err, dupe) => {
                                    if (!dupe) {
                                        fs.access(Path.resolve(path), err => {
                                            if (err) {
                                                reply += `Path does not exist or is inaccessible.`;
                                                data.m.channel.sendMessage(reply);
                                            } else {
                                                cm.db.libraries.update({name}, {$set: {path: value}}, {}, () => {
                                                    if (name === cm.lib.library.name) {
                                                        cm.lib = new LibraryManager({name: lib.name, path: value, description: lib.description});
                                                    } else {
                                                        let tempLib = new LibraryManager({name: lib.name, path: value, description: lib.description}, data.m.channel);
                                                    }
                                                    reply += `Updated ${name} Library's path.`;
                                                    data.m.channel.sendMessage(reply);
                                                });
                                            }
                                        });
                                    } else {
                                        reply += `Library with the same path already exists.`;
                                        data.m.channel.sendMessage(reply);
                                    }
                                });
                                break;
                            case 'description':
                                cm.db.libraries.update({name}, {$set: {description: value}}, {}, () => {
                                    if (name === cm.lib.library.name) {
                                        cm.lib.library.description = value;
                                    }
                                    reply += `Updated ${name} Library's description.`;
                                    data.m.channel.sendMessage(reply);
                                });
                                break;
                            default:
                                reply += `${key} Key does not exist.`;
                                data.m.channel.sendMessage(reply);
                                break;
                        }
                    } else {
                        reply += `${name} Library does not exist.`;
                        data.m.channel.sendMessage(reply);
                    }
                });
            } else {
                reply += `Invalid amount of parameters.`;
                data.m.channel.sendMessage(reply);
            }
        });
    } else if (cmd === 'select') {
        cm.perms.check(data.m.author.id, 'library.mod.select', allow => {
            if (!allow) return;
            let name = args;

            if (cm.lib) {
                if (cm.lib.library.name === name) {
                    reply += `${name} Library is already selected.`;
                    data.m.channel.sendMessage(reply);
                    return;
                }
            }
            cm.db.libraries.findOne({name}, (err, library) => {
                if (library) {
                    fs.access(Path.resolve(library.path), err => {
                        if (err) {
                            reply += `Library's Path does not exist or is inaccessible on this machine.`;
                        } else {
                            if (cm.lib) cm.db.libraries.update({name: cm.lib.library.name}, {$set: {active: false}}, {});
                            cm.db.libraries.update({name}, {$set: {active: true}}, {});
                            cm.lib = new LibraryManager({name: library.name, path: library.path});
                            reply += `${name} Library has been selected.`;
                        }
                        data.m.channel.sendMessage(reply);
                    });
                } else {
                    reply += `${name} Library does not exist.`;
                    data.m.channel.sendMessage(reply);
                }
            });
        });
    } else if (cmd === '') {
        cm.perms.check(data.m.author.id, 'library.view.active', allow => {
            if (!allow) return;
            if (cm.lib) {
                cm.lib.db.count({}, (err, count) => {
                    reply += `**${cm.lib.library.name} Library**`;
                    if (cm.lib.library.description !== '') reply += `\n${cm.lib.library.description}`;
                    reply += `\nPath: ${cm.lib.library.path}`;
                    reply += `\nSongs: ${count}`;
                    data.m.channel.sendMessage(reply);
                });
            } else {
                reply += `Currently no active library.`;
                data.m.channel.sendMessage(reply);
            }
        });
    } else {
        cm.perms.check(data.m.author.id, 'library.view.detail', allow => {
            if (!allow) return;
            let name = data.args;

            cm.db.libraries.findOne({name}, (err, library) => {
                if (library) {
                    let tempLib = new Datastore({filename: `./libraries/${library.name}.db`, autoload: true});

                    tempLib.count({}, (err, count) => {
                        reply += `**${library.name} Library**`;
                        if (library.description !== '') reply += `\n${library.description}`;
                        reply += `\nPath: ${library.path}`;
                        reply += `\nSongs: ${count}`;
                        data.m.channel.sendMessage(reply);
                    });
                } else {
                    reply += `${name} Library does not exist.`;
                    data.m.channel.sendMessage(reply);
                }
            });
        });
    }
};