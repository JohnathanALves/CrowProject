const electron = require('electron')
const BrowserWindow = electron.remote.BrowserWindow
const remote = electron.remote

const cancelBtn = document.getElementById('cancelBtn')

cancelBtn.addEventListener('click', function(ev) {
    var window = remote.getCurrentWindow();
    window.close()
})