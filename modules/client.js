'use strict';

const mongodb = require('mongodb');
var mongoClient = mongodb.MongoClient;
const { defMongoDB } = require('./config.json');
var url = defMongoDB.url;

var feedBack = (data) => {
    return new Promise((resolve, reject) => {
        var date = new Date();
        data.Date = date;
        var db;
        mongoClient.connect(url).then((resDB) => {
            db = resDB;
            var fb = db.collection(defMongoDB.fb);
            return fb.insertOne(data);
        }).then((resIns) => {
            db.close();
            resolve();
        }).catch((err) => {
            console.log('Error: ', err);
            reject();
        })
    })
}

var getVer = () => {
    return new Promise((resolve, reject) => {
        var db;
        mongoClient.connect(url).then((resDB) => {
            db = resDB;
            var info = db.collection(defMongoDB.info);
            return info.findOne();
        }).then((resFind) => {
            db.close();
            resolve(resFind);
        }).catch((err) => {
            console.log('Error: ', err);
            reject();
        })
    })
}

var updateEdit = () => {
    return new Promise((resolve, reject) => {
        var db;
        mongoClient.connect(url).then((resDB) => {
            db = resDB;
            var info = db.collection(defMongoDB.info);
            return info.findOne();
        }).then((resFind) => {
            var or = [];
            resFind.Edit.forEach((v) => {
                or.push({ Id: v });
            })
            if (or.length > 0) {
                var mess = db.collection(defMongoDB.mess);
                return mess.find({ $or: or }).toArray();
            } else {
                return Promise.resolve([]);
            }
        }).then((result) => {
            db.close();
            resolve(result);
        }).catch((err) => {
            console.log('Error: ', err);
            reject();
        })
    })
}

module.exports = {
    feedBack: feedBack,
    getVer: getVer,
    updateEdit: updateEdit
}