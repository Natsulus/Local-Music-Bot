'use strict';

exports.command = 'list';

exports.aliases = ['songs'];

exports.execute = function (data, cm, funcs) {
    cm.perms.check(data.m.author.id, 'view.list', allow => {
        if (!allow) return;
        let reply = '';

        if (cm.music.current) {
            const played = funcs.digitalTime(Math.floor(cm.bot.voiceConnection.streamTime / 1000));

            reply += `Currently Playing ${cm.music.current.title ? cm.music.current.title : cm.music.current.fileName} [${played}/${cm.music.current.duration}]`;
            if (cm.music.queue.length > 0) {
                let i = 0;

                for (const song of cm.music.queue) {
                    i++;
                    reply += `\n${i}. ${song.title ? song.title : song.fileName} [${song.duration}]`;
                }
            }
            data.m.channel.sendMessage(reply);
        }
    });
};