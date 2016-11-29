const ipc = require('electron').ipcRenderer;
const db = require('../javascripts/db');
const activeWindowMonitor = require('active-window');

// headset
const headset = require('node-neurosky').createClient({
    appName: 'neuroapp',
    appKey: '1234567890abcdef...'
});
let isRealData = true;
headset.connect();

//debugger;

const IS_DEBUG = (process.env.DEBUG) ? true : false;

let isRecording = false;

ipc.on('start recording', (event, data) => {
    let myNotification = new Notification('🔴', {
        body: 'recording started'
    });
    isRecording = true;
});

ipc.on('stop recording', (event, data) => {
    let myNotification = new Notification('⏸', {
        body: 'paused'
    });
    isRecording = false;
});


let time;
let activeWindow;
let isHeadsetConnected;

function operate(data) {
    if(IS_DEBUG) console.log(data);
    if (data.poorSignalLevel != 200) {
        if (!isHeadsetConnected) {
            ipc.send('headset connected');
            isHeadsetConnected = true;
        }
    }
    if (data.poorSignalLevel == 200) {
        if (isHeadsetConnected) {
            ipc.send('headset disconnected');
            isHeadsetConnected = false;
        }
    }
    if (isHeadsetConnected) {
        if (isRecording) {
            time = getTime();
            activeWindow = getActiveWindow();
            if (IS_DEBUG) console.log(data, activeWindow.app);

            // ["time", "app", "window title", "attention", "meditation"];
            db.put([time,
                activeWindow.app,
                activeWindow.title,
                data.eSense.attention,
                data.eSense.meditation
            ]);
        }
        ipc.send('update bar', data.eSense.attention);
    }
}

// Send headset or test data
if (isRealData) {
    headset.on('data', (data) => {
        operate(data);
    });
} else {
    let getRandom = function (min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }
    let data;
    let timerId = setInterval(() => {
        data = {
            poorSignalLevel: 0,
            eSense: {
                attention: getRandom(1, 100),
                meditation: getRandom(1, 100)
            },
        }

        if (fakeSignal) data.poorSignalLevel = 0;
        else data.poorSignalLevel = 200;
        operate(data);
    }, 3000);
}
let fakeSignal = true;

function changeFakeSignal() {
    fakeSignal = !fakeSignal;
}
// active window
let aw = {
    app: '',
    title: ''
};

function getActiveWindow() {
    activeWindowMonitor.getActiveWindow((window) => {
        try {
            aw = {
                app: window.app,
                title: window.title
            }
        } catch (err) {
            console.log(err);
        }
    });
    return aw;
}

// time
function getTime() {

    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    return `${hour}:${min}:${sec}`;
}