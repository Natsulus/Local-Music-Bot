'use strict';

exports.command = 'shuffle';

exports.aliases = ['randomise', 'randomize'];

exports.execute = function (data, cm) {
    cm.perms.check(data.m.author.id, 'queue.shuffle', allow => {
        if (!allow) return;
        let reply = '';

        cm.music.shuffle();
        reply += 'Queue has been shuffled.';
        data.m.channel.sendMessage(reply);
    });
};