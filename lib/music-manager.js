'use strict';

class MusicManager {
    constructor(bot) {
        this.queue = [];
        this.current = null;
        this.bot = bot;
    }

    play() {
        if (this.bot.voiceConnection) {
            if (!this.bot.voiceConnection.playing) {
                if (this.queue.length > 0) {
                    this.current = this.queue.shift();

                    this.bot.voiceConnection.playFile(this.current.filePath, (err, intent) => {
                        if (err) console.log(err);
                        this.current.channel.sendMessage(`Now playing ${this.current.title ? this.current.title : this.current.fileName}`);
                        intent.on('end', () => {
                            if (this.current) this.current.channel.sendMessage(`Finished playing ${this.current.title ? this.current.title : this.current.fileName}`);

                            setTimeout(this.play(this), 2000);
                        });
                    });
                } else {
                    this.current = null;
                }
            }
        }
    }

    shuffle() {
        shuffleArray(this.queue);
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