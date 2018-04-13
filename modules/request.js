'use strict';

const request = require('request');
const { defRequest } = require('./config.json');
var postData = {
    __EVENTTARGET: '',
    __EVENTARGUMENT: '',
    __LASTFOCUS: '',
    __VIEWSTATE: '',
    __VIEWSTATEGENERATOR: '',
    __EVENTVALIDATION: ''
}
var cookie = '';

var getContent = (bool) => {
    return new Promise((resolve, reject) => {
        if (bool) {
            var param = {
                method: 'GET',
                uri: defRequest.uri,
                headers: {
                    cookie: cookie
                }
            }
        } else {
            var param = {
                method: 'GET',
                uri: defRequest.uri
            }
        }
        request(param, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                if (!bool) {
                    cookie = response.headers['set-cookie'][0].split(';')[0];
                }
                resolve(body);
            }
            reject(error);
        })
    })
}

var postContent = (target) => {
    return new Promise((resolve, reject) => {
        request({
            method: 'POST',
            uri: defRequest.uri,
            form: {
                __EVENTTARGET: target,
                __EVENTARGUMENT: '',
                __LASTFOCUS: '',
                __VIEWSTATE: postData.__VIEWSTATE,
                __VIEWSTATEGENERATOR: postData.__VIEWSTATEGENERATOR,
                __EVENTVALIDATION: postData.__EVENTVALIDATION
            },
            headers: {
                cookie: cookie
            }
        }, (error, response, body) => {
            if (!error && response.statusCode == 302) {
                resolve(body);
            }
            reject(error);
        })
    })
}

module.exports = {
    getContent: getContent,
    postContent: postContent,
    postData: postData
}