const fs = require('fs');

const separator = ";";
const fileExt = ".csv";

let dbDir, dbHead, dbFile;
let initDate = getDate();
let currentDate;

dbFile = initDate + fileExt;

// dir - dir to store csv files
// head - csv files header
function init(dir, head, cb) {
    console.log('init', dir, head, cb);
    dbDir = dir;
    dbHead = head;
    createDBdir(dbDir);
    createDBfile(dbFile, dbHead, (e) => {
        if(e) cb(e);
    });
}

let dateTo
let put = function (data, cb) {

    // new day => new file
    currentDate = getDate();
    if (currentDate != initDate) {
        initDate = currentDate;
        dbFile = initDate + fileExt;
        createDBfile(dbFile, dbHead, (e) => {
            if (e) cb(e)
        });
    }

    fs.appendFile(`${dbDir}/${dbFile}`, createCSVString(data), (e) => {
        if(e) cb(e);
    });
}

function createDBdir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
        console.log('DB dir created:', dir);
    }
}

function createDBfile(fileName, header, cb) {
    fs.exists(`${dbDir}/${fileName}`, (exist) => {
        if (!exist) {
            fs.writeFile(`${dbDir}/${fileName}`, createCSVString(header), (e) => {
                if(e) cb(e);
            });
            console.log('create', fileName, header, cb);
        }
    });
}

function createCSVString(data) {
    let str = ``;
    let l = data.length;
    if (l == 1) {
        str = `${data[0]}\n`;
    } else {
        for (let i = 0; i < l; i++) {
            if (i == l - 1) str += `${data[i]}`; // last param without separator
            else str += `${data[i]}${separator}`;
        }
        str += '\n';
    }
    return str;
}

function getDate() {

    var date = new Date();

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return `${day}-${month}-${year}`;

}

module.exports = {
    init: init,
    put: put
};