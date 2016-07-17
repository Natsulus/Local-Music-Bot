'use strict';

exports.command = 'join';

exports.aliases = [];

exports.execute = function (data, cm) {
    cm.perms.check(data.m.author.id, 'voice.join', allow => {
        if (!allow) return;
        if (!cm.bot.voiceConnection) {
            const check = new RegExp(`.*${data.args}.*`, 'i');

            for (const channel of data.m.channel.server.channels.getAll('type', 'voice')) {
                if (channel.name.search(check) !== -1) {
                    cm.bot.joinVoiceChannel(channel);
                    break;
                }
            }
        }
    });
};
