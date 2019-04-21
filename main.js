'use strict';

// Import parts of electron to use
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

// Keep a reference for dev mode
let dev = false;
if (process.defaultApp || /[\\/]electron-prebuilt[\\/]/.test(process.execPath) || /[\\/]electron[\\/]/.test(process.execPath)) {
  dev = true;
}

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1024, height: 768, show: false
  });

  // and load the index.html of the app.
  let indexPath;
  if (dev && process.argv.indexOf('--noDevServer') === -1) {
    indexPath = url.format({
      protocol: 'http:',
      host: 'localhost:8080',
      pathname: 'index.html',
      slashes: true
    });
  } else {
    indexPath = url.format({
      protocol: 'file:',
      pathname: path.join(__dirname, 'dist', 'index.html'),
      slashes: true
    });
  }
  mainWindow.loadURL(indexPath);

  // Don't show until we are ready and loaded
  mainWindow.once('ready-to-show', () => {
    
    mainWindow.show();
    mainWindow.setMenuBarVisibility(true);
    // Open the DevTools automatically if developing
    if (dev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  // 保存图片
  ipcMain.on('save-image', (event, imgDatas, downloadPath, format) => {
    // console.log(imgDatas) // prints "ping"
    
    if (!imgDatas || !imgDatas.length) {
      console.log('没有图片内容');
      event.sender.send('save-image-reply', '没有图片内容');
      return;
    }
    if (!downloadPath) {
      console.log('保存地址为空');
      event.sender.send('save-image-reply', '保存地址为空');
      return;
    }
    // 判断路径是否存在
    if (!fs.existsSync(downloadPath)) {
      console.log('保存地址不存在');
      event.sender.send('save-image-reply', '保存地址不存在');
      return;
    }
    let stat = fs.statSync(downloadPath);
    if (!stat.isDirectory()) {
      console.log('保存地址不是目录');
      event.sender.send('save-image-reply', '保存地址不是目录');
      return;
    }
    
    //接收前台POST过来的base64
    let ps = [];
    for (let i = 0; i < imgDatas.length; i++) {
      if (!imgDatas[i]) {
        continue;
      }
      let p = new Promise((resolve, reject)=> {
        let base64Data = imgDatas[i].replace(/^data:image\/\w+;base64,/, "");
        let dataBuffer = new Buffer(base64Data, 'base64');
        let path = downloadPath + '/' + (i + 1) + format;
        fs.writeFile(path, dataBuffer, function (err) {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
      ps.push(p);
    }
    Promise.all(ps).then((values)=>{
      console.log('success', values);
      event.sender.send('save-image-reply', '保存图片成功，共' + values.length + '张');
    }).catch((err)=>{
      console.log('error', err);
      event.sender.send('save-image-reply', '保存图片报错：' + err);
    });;
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
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

