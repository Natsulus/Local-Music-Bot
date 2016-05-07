'use strict';

exports.command = 'skip';

exports.aliases = ['next'];

exports.execute = function (data, cm) {
    if (cm.bot.voiceConnection && cm.music.current) {
        if (data.args === '') {
            cm.perms.check(data.m.author.id, 'queue.skip.novote', allow => {
                if (!allow) return;
                data.m.channel.sendMessage(`Skipped ${cm.music.current.title ? cm.music.current.title : cm.music.current.fileName}`);
                cm.bot.voiceConnection.stopPlaying();
            });
        } else if (data.args === 'vote') {
            cm.perms.check(data.m.author.id, 'queue.skip.vote', allow => {
                if (!allow) return;
                if (!cm.music.voting) {
                    if (cm.bot.voiceConnection.voiceChannel.members.get('id', data.m.author.id).equals(data.m.author)) {
                        if (cm.bot.voiceConnection.voiceChannel.members.length > 2) {
                            cm.music.startVote(data.m.channel);
                            cm.music.voting.voters.delete(data.m.author.id);
                            cm.music.voting.votes.add(data.m.author.id);
                        } else {
                            data.m.channel.sendMessage(`Skipped ${cm.music.current.title ? cm.music.current.title : cm.music.current.fileName}`, null, () => {
                                cm.bot.voiceConnection.stopPlaying();
                            });
                        }
                    }
                } else {
                    if (cm.music.voting.voters.has(data.m.author.id)) {
                        cm.music.voting.voters.delete(data.m.author.id);
                        cm.music.voting.votes.add(data.m.author.id);

                        if (cm.music.voting.votes.size >= cm.music.voting.req) {
                            data.m.channel.sendMessage(`Voting successful.\nSkipped ${cm.music.current.title ? cm.music.current.title : cm.music.current.fileName}`, {}, () => {
                                cm.music.voting = null;
                                cm.bot.voiceConnection.stopPlaying();
                            });
                        } else {
                            data.m.reply(`has voted!\nTime Remaining: ${60 - Math.floor((Date.now() - cm.music.voting.start) / 1000)} seconds\nCurrent Votes: ${cm.music.voting.votes.size}\nRequired Votes: ${cm.music.voting.req}`);
                        }
                    } else {
                        if (cm.music.voting.votes.has(data.m.author.id)) {
                            data.m.channel.sendMessage(`Time Remaining: ${60 - Math.floor((Date.now() - cm.music.voting.start) / 1000)} seconds\nCurrent Votes: ${cm.music.voting.votes.size}\nRequired Votes: ${cm.music.voting.req}`);
                        }
                    }
                }
            });
        }
    }
};