'use strict';

exports.command = 'queue';

exports.aliases = ['insert', 'q'];

exports.execute = function (data, cm, funcs) {
    cm.perms.check(data.m.author.id, 'query.queue', allow => {
        if (!allow) return;
        if (!cm.lib) return;
        if (!cm.bot.voiceConnection) return;
        let reply = '';
        let length;

        let qry = funcs.processQuery(data.args);
        if (!qry) return;

        if (qry.random) {
            cm.lib.searchLibraryRandom(qry.query, song => {
                song.duration = funcs.digitalTime(Math.round(song.duration));
                song.channel = data.m.channel;
                cm.music.queue.push(song);
                reply += `Added `;
                reply += `${song.title ? song.title : song.fileName}`;
                reply += song.artist ? ` by ${song.artist}` : ``;
                reply += song.album ? ` from ${song.album}` : ``;
                reply += ` to the queue.`;
                cm.music.play();
                data.m.channel.sendMessage(reply);
            });
        } else {
            if (qry.track) {
                if (isNaN(qry.track)) {
                    cm.lib.searchRange(qry.query, qry.sort, qry.track, list => {
                        for (const song of list) {
                            song.duration = funcs.digitalTime(Math.round(song.duration));
                            song.channel = data.m.channel;
                            cm.music.queue.push(song);
                        }
                        reply += `Added ${list.length} songs to the queue.`;
                        cm.music.play();
                        data.m.channel.sendMessage(reply);
                    });
                } else {
                    cm.lib.searchTrack(qry.query, qry.sort, qry.track, song => {
                        song.duration = funcs.digitalTime(Math.round(song.duration));
                        song.channel = data.m.channel;
                        cm.music.queue.push(song);
                        reply += `Added `;
                        reply += `${song.title ? song.title : song.fileName}`;
                        reply += song.artist ? ` by ${song.artist}` : ``;
                        reply += song.album ? ` from ${song.album}` : ``;
                        reply += ` to the queue.`;
                        cm.music.play();
                        data.m.channel.sendMessage(reply);
                    });
                }
            } else {
                cm.lib.searchLibrary(qry.query, qry.sort, qry.page, list => {
                    for (const song of list) {
                        song.duration = funcs.digitalTime(Math.round(song.duration));
                        song.channel = data.m.channel;
                        cm.music.queue.push(song);
                    }
                    reply += `Added ${list.length} songs to the queue.`;
                    cm.music.play();
                    data.m.channel.sendMessage(reply);
                });
            }
        }
    });
};