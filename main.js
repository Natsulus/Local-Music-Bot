'use strict';
const CommandManager = require('./lib/command-manager.js');
const Discord = require('discord.js');
const Datastore = require('nedb');
const config = require('./configDev.json');

const bot = new Discord.Client();
const db = {};

db.libraries = new Datastore({filename: './data/libraries.db', autoload: true});
db.libraries.ensureIndex({fieldName: 'name', unique: true});
db.libraries.ensureIndex({fieldName: 'path', unique: true});
db.roles = new Datastore({filename: './data/roles.db', autoload: true});
db.roles.ensureIndex({fieldName: 'id', unique: true});
db.users = new Datastore({filename: './data/users.db', autoload: true});
db.playlists = new Datastore({filename: './data/playlists.db', autoload: true});

const commandManager = new CommandManager(bot, config, db);

bot.on("warn", m => console.log("[warn]", m));
bot.on("debug", m => console.log("[debug]", m));

bot.on('ready', () => {
    db.libraries.update({name: config.libraryName}, {$set: {name: config.libraryName, path: config.libraryPath}}, {upsert: true});
    db.roles.findOne({default: true}, (err, role) => {
        if (err) console.log(err);
        for (const user of bot.users) {
            db.users.findOne({id: user.id}, (err2, usr) => {
                if (err2) console.log(err2);
                if (!usr) db.users.insert({id: user.id, role: role.id});
            });
        }
        db.users.update({role: 0}, {$set: {role: 10}}, () => {
            db.users.update({id: config.owner}, {$set: {role: 0}});
        });
    });
    console.log("Bot is ready.");
});

bot.on('message', m => {
    commandManager.parse(m);
});

if (config.token !== '') bot.loginWithToken(config.token).catch(err => {console.log(err);});
else bot.login(config.email, config.password).catch(err => {console.log(err);});