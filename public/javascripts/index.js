var sock = io();

sock.on('connection', function (data) {
    //
});

sock.on('connect', function (data) {
    console.log('socket connected');
});

var dataContainer = document.getElementById('dataContainer');
sock.on('data', function (data) {
    console.log(data);
    dataContainer.innerHTML = getData(data);
});

function getData(data) {

    var text;
    if (data.eSense) {
        text = data.eSense.attention + ' ' + data.eSense.meditation + ' ' + data.poorSignalLevel; 
    } else {
        text = 'noEsense ' + data.poorSignalLevel;
    }
    
    return text;
}

function sendEvent() {
    sock.emit('event', {});
}

