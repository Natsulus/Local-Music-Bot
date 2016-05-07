'use strict';

exports.command = 'unqueue';

exports.aliases = ['remove'];

exports.execute = function (data, cm) {
    cm.perms.check(data.m.author.id, 'queue.remove', allow => {
        if (!allow) return;
        if (cm.music.queue.length > 0) {
            if (data.args !== '') {
                if (isNaN(data.args)) {
                    const split = data.args.split('-');
                    const range = {};

                    if (isNaN(Number(split[0])) || isNaN(Number(split[1]))) return;
                    range.start = Number(split[0]);
                    range.end = Number(split[1]);
                    if (range.start > range.end) {
                        const temp = range.start;

                        range.start = range.end;
                        range.end = temp;
                    }
                    if (range.start <= 0) return data.m.channel.sendMessage('Start must be greater than 0.');
                    if (range.end > cm.music.queue.length) return data.m.channel.sendMessage('End must be less than queue length.');
                    const index = range.start - 1;
                    const remove = range.end - index;

                    cm.music.queue.splice(index, remove);
                    data.m.channel.sendMessage(`Tracks ${range.start}-${range.end} has been removed from the queue.`);
                } else {
                    const index = Number(data.args);

                    if (index <= 0) return data.m.channel.sendMessage('Must be greater than 0.');
                    if (index > cm.music.queue.length) return data.m.channel.sendMessage('Must be less than queue length.');

                    cm.music.queue.splice(index - 1, 1);
                    data.m.channel.sendMessage(`Track #${index} has been removed from the queue.`);
                }
            }
        }
    });
};