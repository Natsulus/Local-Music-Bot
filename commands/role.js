'use strict';

exports.command = 'role';

exports.aliases = ['r'];

exports.execute = function (data, cm, funcs) {
    let args = data.args.split(' ');
    const cmd = args.shift();
    let reply = '';

    args = args.join(' ');

    if (cmd === 'view') {
        cm.perms.check(data.m.author.id, 'role.view.detail', allow => {
            if (!allow) return;
            if (funcs.checkInteger(args)) {
                let id = Number(args);

                cm.db.roles.findOne({id}, (err, role) => {
                    if (role) {
                        reply += `**__#${role.id} ${role.name}__**`;
                        reply += `\n**Description:** ${role.description}`;
                        if (role.perm.length > 0) {
                            reply += '\n**Perms:** ';
                            for (const perm of role.perm) {
                                reply += `${perm}, `;
                            }
                            reply = reply.slice(0, -2);
                        }
                    } else {
                        reply += `The role with id #${id} does not exist.`;
                    }
                    data.m.channel.sendMessage(reply);
                });
            }
        });
    } else if (cmd === 'list') {
        cm.perms.check(data.m.author.id, 'role.view.list', allow => {
            if (!allow) return;
            cm.db.roles.find({}).sort({id: 1}).exec((err, roles) => {
                if (err) console.log(err);
                reply += '**__Roles__**';
                for (const role of roles) {
                    reply += `\n#${role.id} ${role.name}`;
                }
                data.m.channel.sendMessage(reply);
            });
        });
    } else if (cmd === 'add') {
        cm.perms.check(data.m.author.id, 'role.mod.add', allow => {
            if (!allow) return;
            args = args.split(' | ');
            if (args.length > 1 && args.length < 4) {
                let id = Number(args[0]);
                let name = args[1];
                let description;

                if (args.length == 3) description = args[2];
                else description = '';

                if (!funcs.checkInteger(id)) return;

                cm.db.roles.findOne({id}, (err, has) => {
                    if (!has) {
                        cm.db.roles.insert({id, name, description, perm: [], default: false}, err2 => {
                            if (err2) console.log(err2);
                            reply += `Added the role ${name} with id #${id}`;
                            data.m.channel.sendMessage(reply);
                        });
                    } else {
                        reply += `A role with id #${id} already exists.`;
                        data.m.channel.sendMessage(reply);
                    }
                });
            }
        });
    } else if (cmd === 'delete') {
        cm.perms.check(data.m.author.id, 'role.mod.delete', allow => {
            if (!allow) return;
            if (funcs.checkInteger(args)) {
                let id = Number(args);

                cm.db.roles.findOne({id}, (err, role) => {
                    if (role) {
                        if (!role.default) {
                            cm.db.roles.remove({id});
                            cm.db.roles.findOne({default: true}, (err2, defRole) => {
                                cm.db.users.update({role: id}, {$set: {role: defRole.id}}, {multi: true}, () => {
                                    reply += `Deleted the role ${role.name}.`;
                                    data.m.channel.sendMessage(reply);
                                });
                            });
                        } else {
                            reply += `You are trying to delete the default role. Please change to another default role before deleting this role.`;
                        }
                    } else {
                        reply += `The role with id #${id} does not exist.`;
                    }
                    data.m.channel.sendMessage(reply);
                });
            }
        });
    } else if (cmd === 'edit') {
        cm.perms.check(data.m.author.id, 'role.mod.edit', allow => {
            if (!allow) return;
            args = args.split(' | ');
            if (args.length === 3) {
                let id = Number(args[0]);
                let key = args[1].toLowerCase();
                let value = args[2];

                if (!funcs.checkInteger(id) || key === 'perm' || key === 'default') return;

                cm.db.roles.findOne({id}, (err, role) => {
                    if (role) {
                        switch(key) {
                            case 'id':
                                if (funcs.checkInteger(value)) {
                                    value = Number(value);
                                    cm.db.roles.findOne({id: value}, (err2, has) => {
                                        if (!has) {
                                            cm.db.roles.update({id}, {$set: {id: value}}, {}, () => {
                                                cm.db.users.update({role: id}, {$set: {role: value}}, {multi: true}, () => {
                                                    reply += `Updated the id of role ${role.name} to #${value}.`;
                                                    data.m.channel.sendMessage(reply);
                                                });
                                            });
                                        } else {
                                            reply += `A role with id #${value} already exists.`;
                                            data.m.channel.sendMessage(reply);
                                        }
                                    });
                                } else {
                                    reply += `Value for the id key must be an integer.`;
                                    data.m.channel.sendMessage(reply);
                                }
                                break;
                            case 'name':
                                cm.db.roles.update({id}, {$set: {name: value}}, {}, () => {
                                    reply += `Updated the name of role with id #${id} to ${value}.`;
                                    data.m.channel.sendMessage(reply);
                                });
                                break;
                            case 'description':
                                cm.db.roles.update({id}, {$set: {description: value}}, {}, () => {
                                    reply += `Updated ${role.name}'s description.`;
                                    data.m.channel.sendMessage(reply);
                                });
                                break;
                            default:
                                reply += `${key} Key does not exist.`;
                                data.m.channel.sendMessage(reply);
                                break;
                        }
                    } else {
                        reply += `The role with id #${id} does not exist.`;
                        data.m.channel.sendMessage(reply);
                    }
                });
            }
        });
    } else if (cmd === 'set') {
        cm.perms.check(data.m.author.id, 'role.mod.set', allow => {
            if (!allow) return;
            args = args.split(' ');
            let id = Number(args.shift());
            args = args.join(' ');
            let userlist = args.split(' | ');

            if (funcs.checkInteger(id) || id === 0) return;

            cm.db.users.findOne({id: data.m.author.id}, {role: 1}, (err, user) => {
                cm.db.roles.findOne({id}, (err2, role) => {
                    if (role) {
                        if (role.id > user.role) {
                            userLoop:
                                for (const usertag of userlist) {
                                    let username = usertag.split('#')[0];
                                    let discriminator = usertag.split('#')[1];

                                    let users = data.m.channel.server.members.getAll('name', username);

                                    for (const user of users) {
                                        if (user.discriminator === discriminator) {
                                            cm.db.users.update({id: user.id}, {$set: {role: role.id}}, () => {
                                                data.m.channel.sendMessage(`Set ${user}'s role to ${role.name}`);
                                            });
                                            continue userLoop;
                                        }
                                    }
                                    data.m.channel.sendMessage(`${usertag} does not exist or is not in this server.`);
                                }
                        } else {
                            data.m.channel.sendMessage(`You have insufficient permission to set to the role ${role.name}.`);
                        }
                    } else {
                        data.m.channel.sendMessage(`The role with id #${id} does not exist.`);
                    }
                });
            });
        });
    } else if (cmd === 'default') {
        if (args === '') {
            cm.perms.check(data.m.author.id, 'role.default.view', allow => {
                if (!allow) return;
                cm.db.roles.findOne({default: true}, (err, role) => {
                    if (err) console.log(err);
                    if (role) {
                        reply += `**__#${role.id} ${role.name}__**`;
                        reply += `\n**Description:** ${role.description}`;
                        if (role.perm.length > 0) {
                            reply += '\n**Perms:** ';
                            for (const perm of role.perm) {
                                reply += `${perm}, `;
                            }
                            reply = reply.slice(0, -2);
                        }
                        data.m.channel.sendMessage(reply);
                    }
                });
            });
        } else {
            cm.perms.check(data.m.author.id, 'role.default.set', allow => {
                if (!allow) return;
                if (funcs.checkInteger(args)) {
                    let id = Number(args);

                    if (id <= 5) return data.m.channel.sendMessage(`The role id must be greater than 5.`);

                    cm.db.roles.findOne({id}, (err, role) => {
                        if (role) {
                            cm.db.roles.update({default: true}, {$set: {default: false}}, {});
                            cm.db.roles.update({id}, {$set: {default: true}}, {});
                            reply += `Updated the default role to ${role.name}.`;
                        } else {
                            reply += `The role with id #${id} does not exist.`;
                        }
                        data.m.channel.sendMessage(reply);
                    });
                }
            });
        }
    } else if (cmd === 'give') {
        cm.perms.check(data.m.author.id, 'role.perm.give', allow => {
            if (!allow) return;
            let perms = args.split(' ');
            let id = Number(perms.shift());

            if (!funcs.checkInteger(id) || id === 0) return;

            cm.db.roles.findOne({id}, (err, role) => {
                if (role) {
                    cm.db.users.findOne({id: data.m.author.id}, (err, user) => {
                        if (id > user.role) {
                            for (const perm of perms) {
                                let permArr = [];
                                cm.perms.valid(permArr, perm);
                                cm.db.roles.update({id}, {$addToSet: {perm: {$each: permArr}}});
                            }
                            reply += `Gave all valid perms provided to the role ${role.name}.`;
                            data.m.channel.sendMessage(reply);
                        } else {
                            data.m.channel.sendMessage(`You have insufficient permission to give perms to the role ${role.name}.`);
                        }
                    });
                } else {
                    reply += `The role with id #${id} does not exist.`;
                    data.m.channel.sendMessage(reply);
                }
            });
        });
    } else if (cmd === 'remove') {
        cm.perms.check(data.m.author.id, 'role.perm.remove', allow => {
            if (!allow) return;
            let perms = args.split(' ');
            let id = Number(perms.shift());

            if (!funcs.checkInteger(id) || id === 0) return;

            cm.db.roles.findOne({id}, (err, role) => {
                if (role) {
                    cm.db.users.findOne({id: data.m.author.id}, (err, user) => {
                        if (id > user.role) {
                            for (const perm of perms) {
                                let permArr = [];
                                cm.perms.valid(permArr, perm);
                                cm.db.roles.update({id}, {$pull: {perm: {$in: permArr}}});
                            }
                            reply += `Removed all valid perms provided from the role ${role.name}.`;
                            data.m.channel.sendMessage(reply);
                        } else {
                            data.m.channel.sendMessage(`You have insufficient permission to remove perms from the role ${role.name}.`);
                        }
                    });
                } else {
                    reply += `The role with id #${id} does not exist.`;
                    data.m.channel.sendMessage(reply);
                }
            });
        });
    } else if (cmd === '') {
        cm.perms.check(data.m.author.id, 'role.view.own', allow => {
            if (!allow) return;
            cm.perms.getRole(data.m.author.id, (err, role) => {
                if (err) return;
                reply += `**__#${role.id} ${role.name}__**`;
                reply += `\n**Description:** ${role.description}`;
                if (role.perm.length > 0) {
                    reply += '\n**Perms:** ';
                    for (const perm of role.perm) {
                        reply += `${perm}, `;
                    }
                    reply = reply.slice(0, -2);
                }
                data.m.channel.sendMessage(reply);
            });
        });
    } else {
        cm.perms.check(data.m.author.id, 'role.view.other', allow => {
            if (!allow) return;
            let usertag = data.args;
            let username = usertag.split('#')[0];
            let discriminator = usertag.split('#')[1];

            let users = data.m.channel.server.members.getAll('name', username);

            for (const user of users) {
                if (user.discriminator === discriminator) {
                    cm.perms.getRole(user.id, (err, role) => {
                        if (err) return;
                        reply += `**__#${role.id} ${role.name}__**`;
                        reply += `\n**Description:** ${role.description}`;
                        if (role.perm.length > 0) {
                            reply += '\n**Perms:** ';
                            for (const perm of role.perm) {
                                reply += `${perm}, `;
                            }
                            reply = reply.slice(0, -2);
                        }
                        data.m.channel.sendMessage(reply);
                    });
                }
            }
        });
    }
};