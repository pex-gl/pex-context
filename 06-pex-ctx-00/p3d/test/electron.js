var app = require('app');
var BrowserWindow = require('browser-window');
var mainWindow = null;


//var html = '' +
//'<!DOCTYPE html>\n' +
//'<html lang="en">\n' +
//'<head><meta charset="UTF-8"><script src="'+ process.argv[2] + '.js"></script></head>\n' +
//'<body></body></html>';

//console.log(html);

//var htmlDataUrl = 'data:text/html,' + encodeURIComponent(html);

app.on('window-all-closed', function() {
  app.quit();
});

app.on('ready', function() {
  mainWindow = new BrowserWindow({width: 1280, height: 720, 'web-preferences': { 'web-security': false } });
  //mainWindow.loadUrl(htmlDataUrl);
  mainWindow.loadUrl('file://' + __dirname + '/' + process.argv[2] + '.html');
  mainWindow.openDevTools();
  mainWindow.on('closed', function() {
    mainWindow = null;
  });
});
