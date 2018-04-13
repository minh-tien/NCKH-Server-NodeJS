'use strict';

const {
    request,
    cheerio,
    socket,
    mongodb
} = require('./modules');
const cron = require('cron').CronJob;
const config = require('./modules/config.json');
var result = [];
var finish = true;

var ioSocket = () => {
    mongodb.selectDB().then((docs) => {
        socket.ioConnect();
    }).catch((err) => {
        console.log('Error: ', err);
        ioSocket();
    })
}

var getAll = (index) => {
    return request.postContent(`${config.defRequest.get.targetHead}${index}${config.defRequest.get.targetTail}`).then((body) => {
        return request.getContent(true);
    }).then((body) => {
        var data = cheerio.findMess(body);
        result.push(data);
        return request.postContent(config.defRequest.home);
    }).catch((err) => {
        result = [];
        console.log('Error: ', err);
    })
}

var mainApp = () => {
    return request.getContent(false).then((body) => {
        cheerio.findContent(body);
        return getAll('11');
    }).then(() => {
        return getAll('10');
    }).then(() => {
        return getAll('09');
    }).then(() => {
        return getAll('08');
    }).then(() => {
        return getAll('07');
    }).then(() => {
        return getAll('06');
    }).then(() => {
        return getAll('05');
    }).then(() => {
        return getAll('04');
    }).then(() => {
        return getAll('03');
    }).then(() => {
        return getAll('02');
    }).catch((err) => {
        result = [];
        console.log('Error: ', err);
    })
}

ioSocket();
var job = new cron({
    cronTime: '0 */5 * * * *',
    onTick: () => {
        if (finish) {
            finish = false;
            mainApp().then(() => {
                return mongodb.checkEdit(result);
            }).then(() => {
                return mongodb.insertDB(result);
            }).then(() => {
                result = [];
                finish = true;
            }).catch((err) => {
                result = [];
                finish = true;
                console.log('Error: ', err);
            })
        }
    },
    start: true
})