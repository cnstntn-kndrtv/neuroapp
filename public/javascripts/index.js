const ipc = require('electron').ipcRenderer;
const db = require('../../lib/db');
const activeWindowMonitor = require('../../lib/active-window');

//debugger;
const IS_DEBUG = (process.env.DEBUG) ? true : false;

// headset
const headset = require('../../lib/neurosky').createClient({
    appName: 'neuroapp',
    appKey: '1234567890abcdef...'
});

// connect headset
function connect() {
    return new Promise((resolve, reject) => {
        headset.connect(() => {
            // connected
            console.log('headset connected');
            ipc.send('headset connected');
            let myNotification = new Notification('✅', {
                body: 'connected'
            });
            console.log('--- wait for data from headset');
            headset.on('data', (data) => {
                operate(data);
            });
            resolve();
        }, () => {
            // connection error
            ipc.send('headset disconnected');
            console.log('Headset connection error');
            let myNotification = new Notification('❌', {
                body: 'connection error'
            });
            //reject();
        });
    });
}

ipc.send('headset disconnected');
connect();

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

ipc.on('reconnect headset', (event, data) => {
    connect();
});


let time
    , activeWindow
    , blink
    , isData;

function operate(data) {
    if (IS_DEBUG) console.log('poorSignalLevel', data.poorSignalLevel);
    if (data.poorSignalLevel != 200) {
        if (!isData) {
            ipc.send('headset connected');
            isData = true;
        }
    }
    if (data.poorSignalLevel == 200) {
        if (isData || isData == undefined) {
            console.log('no data');
            ipc.send('headset no data');
            isData = false;
        }
    }
    if (isData) {
        if (isRecording) {
            time = getTime();
            activeWindow = getActiveWindow();
            if (IS_DEBUG) {
                console.log('data', data);
                console.log('activeWindow.app', activeWindow.app);
                console.log('activeWindow.title', activeWindow.title);
            }

            // ["time", "app", "window title", "attention", "meditation", 'blink'];
            blink = data.blinkStrength || 0;
            db.put([time,
                activeWindow.app,
                activeWindow.title,
                data.eSense.attention,
                data.eSense.meditation,
                blink
            ]);
        }
        ipc.send('update bar', data.eSense.attention);
    }
}

// Send headset or test data
function main() {
    if (!isRealData) {
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

            if (isFakeSignalActive) data.poorSignalLevel = 0;
            else data.poorSignalLevel = 200;
            operate(data);
        }, 3000);
    }
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


// debug helpers
let isRealData = true;
let isFakeSignalActive = true;

function swichFakeSignal() {
    isFakeSignalActive = !isFakeSignalActive;
    console.log('isFakeSignalActive', isFakeSignalActive);
}

function changeSignalSource() {
    isRealData = !isRealData;
    console.log('isRealData', isRealData);
    main();
}