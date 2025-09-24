const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    savePasswords: (passwords) =>
        ipcRenderer.invoke('save-passwords', passwords),
    loadPasswords: () =>
        ipcRenderer.invoke('load-passwords'),
    windowControls: (action) =>
        ipcRenderer.invoke('window-controls', action)
});