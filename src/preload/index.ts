import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// API for renderer - includes touch emulation
const api = {
    enableTouchEmulation: (webContentsId: number, width: number, height: number, isMobile: boolean) =>
        ipcRenderer.invoke('enable-touch-emulation', webContentsId, width, height, isMobile),

    disableTouchEmulation: (webContentsId: number) =>
        ipcRenderer.invoke('disable-touch-emulation', webContentsId),

    checkForUpdates: () =>
        ipcRenderer.invoke('check-for-updates'),

    versions: process.versions,
    platform: process.platform
}

if (process.contextIsolated) {
    try {
        contextBridge.exposeInMainWorld('electron', electronAPI)
        contextBridge.exposeInMainWorld('api', api)
    } catch (error) {
        console.error(error)
    }
} else {
    // @ts-ignore
    window.electron = electronAPI
    // @ts-ignore
    window.api = api
}
