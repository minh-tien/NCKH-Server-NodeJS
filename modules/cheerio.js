'use strict';

const cheerio = require('cheerio');
const request = require('./request');
const { defCheerio } = require('./config.json');
var postData = {
    __VIEWSTATE: '',
    __VIEWSTATEGENERATOR: '',
    __EVENTVALIDATION: ''
}

const filterMess = (data, element) => {
    var preFilter = data[element].replace(/<li/g, '<p').replace(/<\/li>/g, '</p>');
    var $ = cheerio.load(`<body>${preFilter}</body>`);
    var line = $('body').find('p');
    data[element] = [];
    line.each((index, elem) => {
        var aTag = $(elem).find('a');
        if ($(aTag).length == 0 && $(elem).text().trim().length != 0) {
            data[element].push({
                text: $(elem).text(),
                href: 'empty'
            })
        }
        aTag.each((i, e) => {
            data[element].push({
                text: $(elem).text(),
                href: $(e)[i].attribs.href
            })
        })
    })
}

const findContent = (body) => {
    var $ = cheerio.load(body);
    for (var i = 0; i < 3; i++) {
        var data = $(body).find(`${defCheerio.index.tag}#${defCheerio.index.id[i]}`);
        postData[defCheerio.index.id[i]] = data[0].attribs.value;
    }
    request.postData.__VIEWSTATE = postData.__VIEWSTATE;
    request.postData.__VIEWSTATEGENERATOR = postData.__VIEWSTATEGENERATOR;
    request.postData.__EVENTVALIDATION = postData.__EVENTVALIDATION;
}

const findMess = (body) => {
    var $ = cheerio.load(body);
    var data = {
        "MessageSubject": $(body).find(`${defCheerio.mess.tag}#${defCheerio.mess.id.MessageSubject}`).text(),
        "Date": $(body).find(`${defCheerio.mess.tag}#${defCheerio.mess.id.Date}`).text(),
        "MessageNote": $(body).find(`${defCheerio.mess.tag}#${defCheerio.mess.id.MessageNote}`).html(),
        "MessageBody": $(body).find(`${defCheerio.mess.tag}#${defCheerio.mess.id.MessageBody}`).html(),
        "SenderName": $(body).find(`${defCheerio.mess.tag}#${defCheerio.mess.id.SenderName}`).text()
    }
    filterMess(data, 'MessageNote');
    filterMess(data, 'MessageBody');
    return data;
}

module.exports = {
    findContent: findContent,
    findMess: findMess
}