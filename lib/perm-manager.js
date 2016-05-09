'use strict';
const perms = {
    query: {
        search: false,
        queue: false
    },
    voice: {
        join: false,
        leave: false
    },
    view: {
        current: false,
        list: false,
        cover: false
    },
    queue: {
        remove: false,
        shuffle: false,
        skip: {
            novote: false,
            vote: false
        }
    },
    role: {
        view: {
            own: false,
            other: false,
            detail: false,
            list: false
        },
        mod: {
            add: false,
            delete: false,
            edit: false,
            set: false
        },
        default: {
            view: false,
            set: false
        },
        perm: {
            give: false,
            remove: false
        }
    },
    library: {
        view: {
            active: false,
            detail: false,
            list: false
        },
        mod: {
            add: false,
            delete: false,
            edit: false,
            set: false
        },
        update: {
            active: false,
            other: false
        }
    },
    playlist: {
        view: {
            detail: false,
            list: false
        },
        save: false,
        load: false,
        delete: {
            own: false,
            other: false
        }
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
						Objectifier.set(temp, perm, true);
                    }
					console.log(temp);
                    cb(Objectifier.get(temp, req));
                });
            }
        });
    }

    valid(arr, perm) {
        let result = Objectifier.get(perms, perm);

        if (typeof result === 'boolean') {
            arr.push(perm);
        } else {
            for (const res in result) {
                this.valid(arr, perm + '.' + res);
            }
        }
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

const Objectifier = (() => {
    function objectifier(obj, splits, create) {
        let result = obj;
        for(let i = 0, s; result && (s = splits[i]); i++) {
            result = (s in result ? result[s] : (create ? result[s] = {} : undefined));
        }
        return result;
    }

    return {
        set: function(obj, search, value) {
            let splits = search.split('.'), s = splits.pop(), result = objectifier(obj, splits, true);
            return result && s ? (result[s] = value) : undefined;
        },
        get: function(obj, search) {
            return objectifier(obj, search.split('.'));
        },
        exists: function(obj, search) {
            return this.get(obj, search) !== undefined;
        }
    };
})();

function fillSub(obj) {
    for (const key in obj) {
        if (isBoolean(obj[key])) {
            obj[key] = true;
        } else {
            fillSub(obj[key]);
        }
    }

    return obj;
}

function isBoolean(obj) {
    return typeof obj === 'boolean';
}

module.exports = PermManager;