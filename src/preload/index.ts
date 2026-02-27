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
    openDevTools: (webContentsId: number, isDocked: boolean) =>
        ipcRenderer.invoke('open-devtools', webContentsId, isDocked),
    saveScreenshot: (filename: string, dataUrl: string) =>
        ipcRenderer.invoke('save-screenshot', filename, dataUrl),
    saveBugReport: (filename: string, content: string) =>
        ipcRenderer.invoke('save-bug-report', filename, content),
    installUpdate: () => ipcRenderer.invoke('install-update'),
    openExternal: (url: string) => ipcRenderer.invoke('open-external', url),

    getAppVersion: () => ipcRenderer.invoke('get-app-version'),

    storeGet: (key: string) => ipcRenderer.invoke('store-get', key),
    storeSet: (key: string, data: any) => ipcRenderer.invoke('store-set', key, data),

    // Auto-update event listeners (SECURITY: use removeListener, not removeAllListeners)
    onUpdateStatus: (callback: (status: string) => void) => {
        const handler = (_event: any, status: string) => callback(status)
        ipcRenderer.on('update-status', handler)
        return () => ipcRenderer.removeListener('update-status', handler)
    },
    onUpdateProgress: (callback: (percent: number) => void) => {
        const handler = (_event: any, percent: number) => callback(percent)
        ipcRenderer.on('update-progress', handler)
        return () => ipcRenderer.removeListener('update-progress', handler)
    },

    // Network request monitoring (from main process webRequest API)
    onNetworkRequest: (callback: (details: any) => void) => {
        const handler = (_event: any, details: any) => callback(details)
        ipcRenderer.on('network-request-completed', handler)
        return () => ipcRenderer.removeListener('network-request-completed', handler)
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
