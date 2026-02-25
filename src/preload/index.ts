import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// API for renderer - includes touch emulation and auto-update events
const api = {
    enableTouchEmulation: (webContentsId: number, width: number, height: number, isMobile: boolean) =>
        ipcRenderer.invoke('enable-touch-emulation', webContentsId, width, height, isMobile),
    toggleTouchCursor: (webContentsId: number, enabled: boolean) =>
        ipcRenderer.invoke('toggle-touch-cursor', webContentsId, enabled),
    disableTouchEmulation: (webContentsId: number) =>
        ipcRenderer.invoke('disable-touch-emulation', webContentsId),

    getAppVersion: () => ipcRenderer.invoke('get-app-version'),

    // Auto-update event listeners
    onUpdateStatus: (callback: (status: string) => void) => {
        ipcRenderer.on('update-status', (_event, status) => callback(status))
        return () => ipcRenderer.removeAllListeners('update-status')
    },
    onUpdateProgress: (callback: (percent: number) => void) => {
        ipcRenderer.on('update-progress', (_event, percent) => callback(percent))
        return () => ipcRenderer.removeAllListeners('update-progress')
    },

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
