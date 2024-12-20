const { app, BrowserWindow } = require('electron');
function createWindow() {
    const win = new BrowserWindow({ width: 800, height: 800 });
    win.loadFile('index.html'); // 프로젝트의 index.html 로드
}
app.whenReady().then(() => createWindow());