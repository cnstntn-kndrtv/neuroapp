var fs = require('fs');

let header = ["time", "app", "window title", "attention", "meditation"];
let separator = ";";

let dbDir = __dirname + '/../../data'
createDBFolder(dbDir);

let dbFile = getDate() + '.csv';
createDBFile(`${dbDir}/${dbFile}`);

function createDBFolder(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
}

function createDBFile(fileName) {
    fs.exists(fileName, (exist) => {
        if (!exist) {
            fs.writeFile(fileName, createCSVString(header), (err) => {
                if (err) console.log(err);
            });
        }
    });
}

let put = function(data) {
    fs.appendFile(`${dbDir}/${dbFile}`, createCSVString(data), (err) => {
        if (err) console.log(err);
    });
}

function createHeader() {
    return createCSVString(header);
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
    put: put
};