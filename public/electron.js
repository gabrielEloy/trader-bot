const electron = require('electron');
const { app, BrowserWindow } = electron;

const path = require('path');
const url = require('url');
const isDev = require('electron-is-dev');

let mainWindow;// 

function createWindow() {
  mainWindow = new BrowserWindow({
    icon: __dirname + '/favicon.ico',
    webPreferences: {
			nodeIntegration: true,
		},
  });
  mainWindow.maximize();
  // mainWindow.setMenu(null)
  /* mainWindow.removeMenu(); */
  mainWindow.setTitle("H Trader");

  mainWindow.loadURL(isDev ? 'http://localhost:3000' :
    url.format({
      pathname: path.join(__dirname, '../build/index.html'),
      protocol: 'file:',
      slashes: true
    })
  )
  //`file://${path.join(__dirname, '../build/index.html')}`);
  mainWindow.on('closed', () => mainWindow = null);
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
