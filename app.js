const {
  app,
  BrowserWindow,
} = require('electron');
const ipc = require('electron').ipcMain;
const path = require('path');
const url = require('url');
const debug = require('debug')('app:server');

// reload on source change
// require('electron-reload')(__dirname, {
//   electron: require('electron-prebuilt')
// });

// headset
const neurosky = require('node-neurosky');
const headset = neurosky.createClient({
  appName: 'neuroapp',
  appKey: '1234567890abcdef...'
});
headset.connect();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win
const DEBUG = (process.env.DEBUG) ? true : false;

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 500,
    height: 200,
    //frame: false,
    //titleBarStyle: 'hidden',
    transparent: true,
    show: false
  });
  // Open the DevTools in DEBUG mode
  if (DEBUG) win.webContents.openDevTools();

  // show when ready
  win.once('ready-to-show', () => {
    win.show();
  });

  // and load the index.html of the app.
  win.loadURL(url.format({
    pathname: path.join(__dirname, './public/views/index.html'),
    protocol: 'file:',
    slashes: true
  }));

  headset.on('data', (data) => {
    console.log(data);
    win.webContents.send('data', data);
    ipc.sendSync('data', data);
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