'use strict';
const mm = require('musicmetadata');
const fs = require('fs');

exports.command = 'cover';

exports.aliases = ['art', 'artwork', 'albumart', 'image'];

exports.execute = function (data, cm) {
    cm.perms.check(data.m.author.id, 'view.cover', allow => {
        if (!allow) return;
        if (cm.music.current) {
            mm(fs.createReadStream(cm.music.current.filePath), {duration: true}, (err2, meta) => {
                if (meta.picture.length > 0) {
                    data.m.channel.sendFile(meta.picture[0].data);
                } else {
                    data.m.channel.sendMessage("File does not have any artwork.");
                }
            });
        }
    });
};