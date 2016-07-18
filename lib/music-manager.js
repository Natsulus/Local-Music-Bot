'use strict';

class MusicManager {
    constructor(bot) {
        this.queue = [];
        this.current = null;
        this.bot = bot;
        this.voting = null;
        this.autoplay = false;
    }

    play(data, cm, funcs) {
        if (this.bot.voiceConnection) {
            if (!this.bot.voiceConnection.playing) {
                if (this.queue.length > 0) {
                    this.current = this.queue.shift();

                    this.bot.voiceConnection.playFile(this.current.filePath, (err, intent) => {
                        if (err) console.log(err);
                        this.current.channel.sendMessage(`Now playing ${this.current.title ? this.current.title : this.current.fileName}`);
                        intent.on('end', () => {
                            if (this.voting) {
                                clearTimeout(this.voting.timer);
                                this.voting.channel.sendMessage('Voting cancelled.');
                                this.voting = null;
                            }
                            if (this.current) {
                                this.current.channel.sendMessage(`Finished playing ${this.current.title ? this.current.title : this.current.fileName}`, {}, () => {
                                    this.play(data, cm, funcs);
                                });
                            } else {
                                setTimeout(this.play(data, cm, funcs), 2000);
                            }
                        });
                    });
                }
                // If the queue is empty and autoplay is set, add a new song to the queue
                else if (this.autoplay) {
                    cm.lib.searchLibraryRandom({}, song => {
                        song.duration = funcs.digitalTime(Math.round(song.duration));
                        song.channel = data.m.channel;
                        this.queue.push(song);
                        this.play(data, cm, funcs);
                    });
                }
                else {
                    this.current = null;
                }
            }
        }
    }

    shuffle() {
        shuffleArray(this.queue);
    }

    startVote(channel) {
        const voters = new Set();
        for (const user of this.bot.voiceConnection.voiceChannel.members) {
            if (this.bot.user.equals(user)) continue;
            voters.add(user.id);
        }
        this.voting = {
            channel,
            timer: setTimeout(() => {
                this.endVote();
            }, 60000),
            start: Date.now(),
            req: Math.ceil(((voters.size + 0.5))),
            votes: new Set(),
            voters
        };
        channel.sendMessage(`Time Remaining: 60 seconds\nCurrent Votes: 1\nRequired Votes: ${this.voting.req}`);
    }

    endVote() {
        this.voting.channel.sendMessage('Voting failed.');
        this.voting = null;
    }
}

//  Durstenfeld shuffle
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = array[i];

        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

module.exports = MusicManager;
