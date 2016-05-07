'use strict';

exports.command = 'leave';

exports.aliases = [];

exports.execute = function (data, cm) {
    cm.perms.check(data.m.author.id, 'voice.leave', allow => {
        if (!allow) return;
        if (cm.bot.voiceConnection) {
            cm.music.current = null;
            cm.music.queue = [];
            cm.bot.leaveVoiceChannel(cm.bot.voiceConnection.voiceChannel);
        }
    });
};