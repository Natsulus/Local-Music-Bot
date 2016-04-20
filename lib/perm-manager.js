'use strict';
const perms = {
    search: false,
    list: false,
    current: false,
    queue: false,
    join: false,
    leave: false,
    skip: false,
    unqueue: false,
    shuffle: false,
    update: {
        library: false,
        schedule: false
    },
    role: {
        view: false,
        add: false,
        delete: false,
        edit: false,
        default: false,
        list: false,
        set: false
    },
    library: {
        view: false,
        add: false,
        delete: false,
        edit: false,
        select: false,
        list: false
    },
    playlist: {
        list: false,
        view: false,
        save: false,
        load: false,
        delete: false
    }
};

class PermManager {
    constructor(db) {
        this.roles = db.roles;
        this.users = db.users;
    }

    check(id, req, cb) {
        const temp = perms;

        this.users.findOne({id}, (err, user) => {
            if (err) console.log(err);
            if (user.role === 0) {
                cb(true);
            } else {
                this.roles.findOne({id: user.role}, (err2, role) => {
                    if (err2) console.log(err2);
                    for (const perm of role.perm) {
                        if (isEmpty(temp[perm])) {
                            temp[perm] = true;
                        } else {
                            for (const key in temp[perm])
                                temp[perm][key] = true;
                        }
                    }
                    cb(temp[req]);
                });
            }
        });
    }

    getRole(id, cb) {
        this.users.findOne({id}, {role: 1}, (err, user) => {
            if (err) console.log(err);
            if (user) {
                this.roles.findOne({id: user.role}, (err2, role) => {
                    if (err2) console.log(err2);
                    if (role) {
                        cb(null, role);
                    } else {
                        cb(true, null);
                    }
                });
            } else {
                cb(true, null);
            }
        });
    }
}

function isEmpty(obj) {
    for (const key in obj) {
        if (obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

module.exports = PermManager;