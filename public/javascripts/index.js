const jQuery = require('jquery');
const bootstrap = require('bootstrap');
const ipc = require('electron').ipcRenderer;
const PouchDB = require('pouchdb');
const neurosky = require('node-neurosky');
const activeWindowMonitor = require('active-window');

// headset
const headset = neurosky.createClient({
    appName: 'neuroapp',
    appKey: '1234567890abcdef...'
});
headset.connect();

const IS_DEBUG = (process.env.DEBUG) ? true : false;

let db = new PouchDB('kittens');

// Send headset data
// headset.on('data', (data) => {
//   console.log(data);
//   win.webContents.send('data', data);
//   //ipc.sendSync('data', data);
// });

// test data send
function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}
let data;
let iconFile;
let timerId = setInterval(() => {
    data = {
        eSense: {
            attention: getRandom(1, 100),
            meditation: getRandom(1, 100)
        },
    }

    data.activeWindow = getActiveWindow();
    data.time = getDateTime();

    if (IS_DEBUG) console.log(data);
    //db.put(data);
    ipc.send('update icon', {
        attention: data.eSense.attention,
        meditation: data.eSense.meditation
    });
}, 1000);

let activeWindow;
function getActiveWindow() {
    activeWindowMonitor.getActiveWindow((window) => {
        try {
            activeWindow = {
                app: window.app,
                title: window.title
            }
        } catch (err) {
            console.log(err);
            activeWindow = null;
        }
    });
    return activeWindow;
}

function getDateTime() {

    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return year + ":" + month + ":" + day + ":" + hour + ":" + min + ":" + sec;

}

/*

let dataContainer = document.getElementById('dataContainer');
let attentionGraph = document.getElementById('attention');
let meditationGraph = document.getElementById('meditation');

let attention = {
    level: 0,
    colorLow: '#F4C3BC',
    colorMidLow: '#ED6A5A',
    colorMid: '#EF5B47',
    colorMidHigh: '#C94736',
    colorHigh: '#7C3026',
};

let meditation = {
    level: 0,
    colorLow: '#6594B9',
    colorMidLow: '#5584AC',
    colorMid: '#43719D',
    colorMidHigh: '#356291',
    colorHigh: '#2C598A',
};

let poorSignal = {
    level: 0
}

function updateGraph(data) {
    if (data.eSense) {
        attention.level = data.eSense.attention;
        meditation.level = data.eSense.meditation;
        poorSignal.level = data.poorSignalLevel;

        text = attention.level + ' ' + meditation.level + ' ' + poorSignal.level;

        if (attention.level < 20) attentionGraph.style.backgroundColor = attention.colorLow;
        else if (attention.level >= 20 && attention.level < 40) attentionGraph.style.backgroundColor = attention.colorMidLow;
        else if (attention.level >= 40 && attention.level < 60) attentionGraph.style.backgroundColor = attention.colorMid;
        else if (attention.level >= 60 && attention.level < 80) attentionGraph.style.backgroundColor = attention.colorMidHigh;
        else if (attention.level >= 80 && attention.level <= 100) attentionGraph.style.backgroundColor = attention.colorHigh;
        attentionGraph.style.width = attention.level + '%';
        attentionGraph.innerText = attention.level;

        if (meditation.level < 20) meditationGraph.style.backgroundColor = meditation.colorLow;
        else if (meditation.level >= 20 && meditation.level < 40) meditationGraph.style.backgroundColor = meditation.colorMidLow;
        else if (meditation.level >= 40 && meditation.level < 60) meditationGraph.style.backgroundColor = meditation.colorMid;
        else if (meditation.level >= 60 && meditation.level < 80) meditationGraph.style.backgroundColor = meditation.colorMidHigh;
        else if (meditation.level >= 80 && meditation.level <= 100) meditationGraph.style.backgroundColor = meditation.colorHigh;
        meditationGraph.style.width = meditation.level + '%';
        meditationGraph.innerText =  meditation.level;
    }
}
*/