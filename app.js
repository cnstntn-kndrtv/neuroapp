const {
  app,
  BrowserWindow,
  Menu
} = require('electron');
const ipc = require('electron').ipcMain;
const path = require('path');
const url = require('url');
const debug = require('debug')('app:server');

// dev mode
const isDev = require('electron-is-dev');

// global variables
global.globalVars = {
  IS_DEV: isDev,
  IS_DEBUG: (process.env.DEBUG) ? true : false,
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

// single instance of app
const shouldQuit = app.makeSingleInstance((argv, workingDirectory) => {
  //
});

if (shouldQuit) {
  app.quit();
}

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    title: 'my neuro app',
    width: 500,
    height: 500,
    resizable: true,
    center: true,
    //frame: false,
    //titleBarStyle: 'hidden',
    //transparent: true,
    show: false,
    //icon: __dirname + '/1.icns'
  });

  if (global.globalVars.IS_DEV) app.dock.setIcon(__dirname + '/public/images/brain.png');

  // Open the DevTools in DEBUG mode
  if (global.globalVars.IS_DEBUG) win.webContents.openDevTools();

  // show when ready
  win.once('ready-to-show', () => {
    if (global.globalVars.IS_DEBUG) win.show();
  });

  // and load the index.html of the app.
  win.loadURL(url.format({
    pathname: path.join(__dirname, './public/views/index.html'),
    protocol: 'file:',
    slashes: true
  }));

  // docke menus
  const dockMenuRecording = Menu.buildFromTemplate([{
    label: '⏸ pause record',
    click() {
      debug('Stop');
      stoptRecording();
    }
  }]);

  const dockMenuStopped = Menu.buildFromTemplate([{
    label: '🔴 Start record',
    click() {
      debug('Start');
      startRecording();
    }
  }]);

  const dockMenuDisabled = Menu.buildFromTemplate([{
    label: '🛠 reconnect',
    click() {
      debug('reconnect');
      win.webContents.send('reconnect headset');
    }
  }]);

  let isRecording = false;
  let isHeadSetConnected;
  //setDisconnectedState();

  function startRecording() {
    if (!isRecording) {
      isRecording = true;
    }
    win.webContents.send('start recording');
    app.dock.setBadge(' ');
    app.dock.setMenu(dockMenuRecording);
  }

  function stoptRecording() {
    if (isRecording) {
      isRecording = false;
    }
    win.webContents.send('stop recording');
    app.dock.setBadge('');
    app.dock.setMenu(dockMenuStopped);
  }

  function setConnectedState() {
    debug('headset connected');
    if (isRecording) {
      startRecording();
    } else {
      stoptRecording();
    }
  }

  function setDisconnectedState() {
    debug('headset disconnected');
    // if (isHeadSetConnected) {
    //   isHeadSetConnected = false;
    // }
    win.setProgressBar(-1);
    app.dock.setBadge('💀');
    app.dock.setMenu(dockMenuDisabled);
  }

  function setNoDataState() {
    debug('headset no data');
    win.setProgressBar(-1);
    app.dock.setBadge('NO DATA');
    app.dock.setMenu(dockMenuDisabled);
  }

  ipc.on('update bar', (event, data) => {
    debug(data);
    win.setProgressBar(data / 100);
  });

  ipc.on('headset connected', (event, data) => {
    console.log('+');
    setConnectedState();
  });

  ipc.on('headset disconnected', (event, data) => {
    setDisconnectedState();
  });

  ipc.on('headset no data', (event, data) => {
    setNoDataState();
  });

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
});