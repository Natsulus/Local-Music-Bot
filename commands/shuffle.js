'use strict';

exports.command = 'shuffle';

exports.aliases = ['randomise', 'randomize'];

exports.execute = function (data, cm) {
    cm.perms.check(data.m.author.id, 'queue.shuffle', allow => {
        if (!allow) return;
        let reply = '';

        if (cm.music.queue.length > 1) {
            cm.music.shuffle();
            reply += 'Queue has been shuffled.';
        } else {
            reply += 'Queue too small to be shuffled.';
        }
        data.m.channel.sendMessage(reply);
    });
};