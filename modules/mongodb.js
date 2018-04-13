'use strict';

const mongodb = require('mongodb');
const socket = require('./socket');
var mongoClient = mongodb.MongoClient;
const { defMongoDB } = require('./config.json');
var url = defMongoDB.url;

var checkExist = (mess, data, count, flag) => {
    return new Promise((resolve, reject) => {
        if (data.length > 0 && ((data.length != 10 && !flag) || flag)) {
            data.forEach((value) => {
                value.Id = count;
                count++;
            })
            mess.insertMany(data).then((resUps) => {
                socket.ioUpdate(data);
                selectDB();
                resolve();
            }).catch((err) => {
                console.log('Error: ', err);
                reject(err);
            })
        } else {
            resolve();
        }
    })
}

var insertDB = (data) => {
    return new Promise((resolve, reject) => {
        var db, mess, count;
        mongoClient.connect(url).then((resDB) => {
            db = resDB;
            mess = db.collection(defMongoDB.mess);
            return mess.count();
        }).then((countMess) => {
            count = countMess;
            return mess.findOne({ Id: count - 1 });
        }).then((resMess) => {
            var flag = true;
            if (resMess != null) {
                flag = false;
                delete resMess.Id;
                delete resMess._id;
                for (let i = 0; i < 10; i++) {
                    if (JSON.stringify(resMess) == JSON.stringify(data[i])) {
                        data = data.slice(i + 1);
                        return checkExist(mess, data, count, flag);
                    }
                }
            }
            return checkExist(mess, data, count, flag);
        }).then(() => {
            db.close();
            resolve();
        }).catch((err) => {
            console.log('Error: ', err);
            reject(err);
        })
    })
}

var selectDB = () => {
    return new Promise((resolve, reject) => {
        var db, mess;
        mongoClient.connect(url).then((resDB) => {
            db = resDB;
            mess = db.collection(defMongoDB.mess);
            return mess.count();
        }).then((id) => {
            return mess.find({ Id: { $gte: id - 100 } }).sort({ Id: 1 }).toArray();
        }).then((docs) => {
            db.close();
            docs.forEach((value) => {
                delete value._id;
            })
            socket.dataDB.data = docs;
            resolve(docs);
        }).catch((err) => {
            console.log('Error: ', err);
            reject();
        })
    })
}

var checkEdit = (result) => {
    return new Promise((resolve, reject) => {
        var db, mess, count,
            edit = [],
            promise = [];
        mongoClient.connect(url).then((resDB) => {
            db = resDB;
            mess = db.collection(defMongoDB.mess);
            return mess.count();
        }).then((id) => {
            count = id;
            return mess.find({ Id: { $gte: id - 10 } }).sort({ Id: 1 }).toArray();
        }).then((docs) => {
            for (var i = 0; i < docs.length; i++) {
                delete docs[i].Id;
                delete docs[i]._id;
                for (var j = 0; j < result.length; j++) {
                    if (docs[i].MessageSubject == result[j].MessageSubject) {
                        if (JSON.stringify(docs[i]) != JSON.stringify(result[j])) {
                            edit.push([count + i - 10, result[j]]);
                        } else {
                            break;
                        }
                    }
                }
            }
            edit.forEach((value) => {
                promise.push(updateEdit(mess, value));
            })
            return Promise.all(promise);
        }).then((all) => {
            return selectDB();
        }).then(() => {
            return addEdit(db, edit);
        }).then(() => {
            db.close();
            resolve();
        }).catch((err) => {
            console.log('Error: ', err);
            reject();
        })
    })
}

var updateEdit = (mess, value) => {
    return new Promise((resolve, reject) => {
        value[1].Id = value[0];
        mess.update(
            { Id: value[0] },
            value[1]
        ).then(() => {
            delete value[1].Id;
            resolve();
        }).catch((err) => {
            console.log('Error: ', err);
            reject();
        })
    })
}

var addEdit = (db, data) => {
    return new Promise((resolve, reject) => {
        var edit = [];
        var info = db.collection(defMongoDB.info);
        info.findOne().then((result) => {
            edit = result.Edit;
            data.forEach((v) => {
                if (edit.indexOf(v[0]) == -1) {
                    edit.push(v[0]);
                }
            })
            return info.findOneAndUpdate({}, { $set: { Edit: edit } });
        }).then(() => {
            resolve();
        }).catch((err) => {
            console.log('Error: ', err);
            reject();
        })
    })
}

module.exports = {
    insertDB: insertDB,
    selectDB: selectDB,
    checkEdit: checkEdit
}