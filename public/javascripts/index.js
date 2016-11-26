const ipc = require('electron').ipcRenderer;
const DEBUG = (process.env.DEBUG) ? true : false;

let dataContainer = document.getElementById('dataContainer');
let attentionGraph = document.getElementById('attention');
let meditationGraph = document.getElementById('meditation');

ipc.on('data', (event, data) => {
    updateGraph(data);
    if (DEBUG) console.log(data);
});

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