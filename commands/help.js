'use strict';

exports.command = 'help';

exports.aliases = ['?', 'h'];

exports.execute = function (data) {
    data.m.channel.sendMessage("http://local-music-bot.rtfd.io/");
};