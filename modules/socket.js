'use strict';

const app = require('express')();
const server = require('http').Server(app).listen(process.env.PORT || 80);
const io = require('socket.io')(server);
const fcm = require('./fcm');
const client = require('./client');
var dataDB = { data: [] };

app.get('/', function (req, res) {
    res.send('');
})

var ioConnect = () => {
    io.on('connection', (socket) => {
        socket.on('hello', (id) => {
            if (parseInt(id) >= dataDB.data[0].Id) {
                id = parseInt(id) - dataDB.data[0].Id;
            }
            var dataSend = dataDB.data.slice(id, dataDB.data.length);
            socket.emit('data', dataSend);
        })
        socket.on('feedback', (bug) => {
            client.feedBack(bug).then((result) => {
                socket.emit('result', 'ok');
            }).catch((err) => {
                console.log('Error: ', err);
            })
        })
        socket.on('check', (ver) => {
            client.getVer().then((result) => {
                socket.emit('update', [result.Ver, result.Link]);
            }).catch((err) => {
                console.log('Error: ', err);
            })
        })
        socket.on('change', (data) => {
            client.updateEdit().then((result) => {
                for (var i = 0; i < result.length; i++) {
                    delete result[i]._id;
                }
                socket.emit('edit', result);
            }).catch((err) => {
                console.log('Error: ', err);
            })
        })
    })
}

var ioUpdate = (data) => {
    data.forEach((item) => {
        delete item._id;
    })
    io.emit('data', data);
    data.forEach((item) => {
        fcm.fcmSend(item.MessageSubject);
    })
}

module.exports = {
    ioConnect: ioConnect,
    ioUpdate: ioUpdate,
    dataDB: dataDB
}