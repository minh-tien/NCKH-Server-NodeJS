'use strict';

const FCM = require('fcm-node');
const serverKey = require('./xxx-firebase-adminsdk-yyy.json');
const { defFCM } = require('./config.json');
var fcm = new FCM(serverKey);

var fcmSend = (body) => {
    var message = {
        to: defFCM.topic,
        notification: {
            title: 'Thông báo TDC',
            body: body,
            sound: 'default'
        }
    }
    fcm.send(message, (err, response) => {
        if (err) {
            console.log('Error: ', err);
        } else {
            console.log("FCM: ", response);
        }
    })
}

module.exports = {
    fcmSend: fcmSend
}