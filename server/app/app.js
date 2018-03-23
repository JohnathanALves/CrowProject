const { app, BrowserWindow } = require('electron');  // Module to control application life.

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform != 'darwin') {
    app.quit();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1281,
    height: 800,
    frame: false,
    icon:'./assets/img/logo.png'
  });

  // and load the index.html of the app.

  mainWindow.loadURL('file://' + __dirname + '/src/index.html');

  // Open the DevTools.
  mainWindow.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
});

// In some file from the main process
// like main.js
// const {ipcMain} = require('electron');

// // Attach listener in the main process with the given ID
// ipcMain.on('request-mainprocess-action', (event, data) => {
//     // Displays the object sent from the renderer process:
//     //{
//     //    message: "Hi",
//     //    someData: "Let's go"
//     //}
//     console.log("aqui");
//     const modalPath = path.join('file://', __dirname, 'details.html')
//     let win = new BrowserWindow({parent: top, modal: true, height: 800, frame: false }) //{ frame: false }

//     win.on('closed', () => { 
//         win = null 
//     });
//     win.loadURL(modalPath);
    
//     win.webContents.on('did-finish-load', () => {
//         win.webContents.send('store-data', data);
//     });
//     //win.webContents.openDevTools();
//     win.once('ready-to-show', () => {
//         win.show();
//     });
// });
