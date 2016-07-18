'use strict';

exports.command = 'autoplay';

exports.aliases = ['auto', 'ap'];

exports.execute = function (data, cm, funcs) {
    cm.perms.check(data.m.author.id, 'queue.autoplay', allow => {
        if (!allow) return;
        if (!cm.lib) return data.m.channel.sendMessage('A library must be selected.');
        if (!cm.bot.voiceConnection) return;
    
        switch (data.args) {
            case 'on':
                cm.music.autoplay = true;
    
                // Start playing music if not already
                if (cm.music.current === null) {
                    cm.music.play(data, cm, funcs);
                }
                break;
            case 'off':
                cm.music.autoplay = false;
                break;
            case 'status':
                data.m.channel.sendMessage(`Autoplay is ${cm.music.autoplay ? 'on' : 'off'}`);
                break;
            default:
                data.m.channel.sendMessage('Usage: autoplay [ on | off | status ].\nEnables or disables autoplay.');
        }
    });
};
