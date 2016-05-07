'use strict';

exports.command = 'search';

exports.aliases = ['find'];

exports.execute = function (data, cm, funcs) {
    cm.perms.check(data.m.author.id, 'query.search', allow => {
        if (!allow) return;
        if (!cm.lib) return data.m.channel.sendMessage('A library must be selected.');
        let reply = '';
        let length;
        
        let qry = funcs.processQuery(data.args);
        if (!qry) return;

        if (qry.random) {
            cm.lib.searchLibraryRandom(qry.query, song => {
                length = funcs.digitalTime(song.duration);
                reply += `${song.title ? song.title : song.fileName}`;
                reply += song.artist ? ` by ${song.artist}` : ``;
                reply += song.album ? ` from ${song.album}` : ``;
                reply += ` [${length}]`;
                data.m.channel.sendMessage(reply);
            });
        } else {
            if (qry.track) {
                if (isNaN(qry.track)) {
                    cm.lib.searchRange(qry.query, qry.sort, qry.track, list => {
                        let songNo = qry.track.start;

                        for (const song of list) {
                            songNo++;
                            length = funcs.digitalTime(song.duration);
                            reply += `\n${songNo}. `;
                            reply += `${song.title ? song.title : song.fileName}`;
                            reply += song.artist ? ` by ${song.artist}` : ``;
                            reply += song.album ? ` from ${song.album}` : ``;
                            reply += ` [${length}]`;
                        }
                        reply = reply.replace(/^\s+|\s+$/g, '');
                        data.m.channel.sendMessage(reply);
                    });
                } else {
                    cm.lib.searchTrack(qry.query, qry.sort, qry.track, song => {
                        length = funcs.digitalTime(song.duration);
                        reply += `${qry.track}. `;
                        reply += `${song.title ? song.title : song.fileName}`;
                        reply += song.artist ? ` by ${song.artist}` : ``;
                        reply += song.album ? ` from ${song.album}` : ``;
                        reply += ` [${length}]`;
                        data.m.channel.sendMessage(reply);
                    });
                }
            } else {
                cm.lib.searchLibrary(qry.query, qry.sort, qry.page, list => {
                    let songNo = qry.page;

                    for (const song of list) {
                        songNo++;
                        length = funcs.digitalTime(song.duration);
                        reply += `\n${songNo}. `;
                        reply += `${song.title ? song.title : song.fileName}`;
                        reply += song.artist ? ` by ${song.artist}` : ``;
                        reply += song.album ? ` from ${song.album}` : ``;
                        reply += ` [${length}]`;
                    }
                    reply = reply.replace(/^\s+|\s+$/g, '');
                    data.m.channel.sendMessage(reply);
                });
            }
        }
    });
};