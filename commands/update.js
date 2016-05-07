'use strict';
const LibraryManager = require('../lib/library-manager.js');
const fs = require('fs');
const Path = require('path');

exports.command = 'update';

exports.aliases = [];

exports.execute = function (data, cm) {
    if (data.args === '') {
        cm.perms.check(data.m.author.id, 'library.update.active', allow => {
            if (!allow) return;
            cm.lib.updateLibrary(data.m.channel);
        });
    } else {
        cm.perms.check(data.m.author.id, 'library.update.other', allow => {
            if (!allow) return;
            let name = data.args;

            if (name === cm.lib.library.name) {
                cm.lib.updateLibrary(data.m.channel);
            } else {
                cm.db.libraries.findOne({name}, (err, lib) => {
                    if (lib) {
                        fs.access(Path.resolve(lib.path), err => {
                            if (err) {
                                data.m.channel.sendMessage(`Path does not exist or is inaccessible.`);
                            } else {
                                let tempLib = new LibraryManager({name: lib.name, path: lib.path, description: lib.description}, data.m.channel);
                            }
                        });
                    } else {
                        data.m.channel.sendMessage(`${name} Library does not exist.`);
                    }
                });
            }
        });
    }
};