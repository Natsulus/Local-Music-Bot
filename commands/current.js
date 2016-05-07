'use strict';

exports.command = 'current';

exports.aliases = ['playing', 'song'];

exports.execute = function (data, cm, funcs) {
    cm.perms.check(data.m.author.id, 'view.current', allow => {
        if (!allow) return;
        let reply = '';

        if (cm.music.current) {
            const played = funcs.digitalTime(Math.floor(cm.bot.voiceConnection.streamTime / 1000));

            reply += `Currently Playing ${cm.music.current.title ? cm.music.current.title : cm.music.current.fileName} [${played}/${cm.music.current.duration}]`;
            data.m.channel.sendMessage(reply);
        }
    });
};