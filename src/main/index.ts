import { app, shell, BrowserWindow, session, ipcMain, dialog, webContents } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { autoUpdater, UpdateInfo, ProgressInfo } from 'electron-updater'

// Configure auto-updater
autoUpdater.autoDownload = true
autoUpdater.autoInstallOnAppQuit = true

// Anti-bot switches
app.commandLine.appendSwitch('disable-blink-features', 'AutomationControlled')
app.commandLine.appendSwitch('disable-site-isolation-trials')
app.commandLine.appendSwitch('disable-features', 'CrossOriginOpenerPolicy,SameSiteByDefaultCookies')

function setupAutoUpdater(mainWindow: BrowserWindow): void {
    if (!is.dev) {
        autoUpdater.checkForUpdates()

        // Check for updates every hour (60 * 60 * 1000 ms)
        setInterval(() => {
            autoUpdater.checkForUpdates().catch((err) => {
                console.error('Error checking for updates:', err)
            })
        }, 60 * 60 * 1000)
    }

    autoUpdater.on('update-available', (_info: UpdateInfo) => {
        // Update will automatically download because autoDownload = true
        mainWindow.webContents.send('update-status', 'downloading')
    })

    autoUpdater.on('update-not-available', () => {
        console.log('App is up to date')
    })

    autoUpdater.on('download-progress', (progress: ProgressInfo) => {
        mainWindow.webContents.send('update-progress', progress.percent)
        mainWindow.setProgressBar(progress.percent / 100)
    })

    autoUpdater.on('update-downloaded', () => {
        mainWindow.setProgressBar(-1)
        dialog.showMessageBox(mainWindow, {
            type: 'info',
            title: 'Update Ready',
            message: 'Update downloaded. The app will restart to install the update.',
            buttons: ['Restart Now', 'Later'],
            defaultId: 0
        }).then((result) => {
            if (result.response === 0) {
                autoUpdater.quitAndInstall()
            }
        })
    })

    autoUpdater.on('error', (error: Error) => {
        console.error('Auto-updater error:', error)
    })
}

function createWindow(): void {
    const deviceSession = session.fromPartition('persist:device')

    deviceSession.setPermissionRequestHandler((_webContents, _permission, callback) => {
        callback(true)
    })

    const mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 800,
        minHeight: 600,
        show: false,
        autoHideMenuBar: true,
        title: 'Humshakals',
        backgroundColor: '#1e1e1e',
        webPreferences: {
            preload: join(__dirname, '../preload/index.js'),
            sandbox: false,
            webviewTag: true,
            nodeIntegration: false,
            contextIsolation: true
        }
    })

    mainWindow.on('ready-to-show', () => {
        mainWindow.show()
        mainWindow.maximize()
    })

    mainWindow.webContents.setWindowOpenHandler((details) => {
        shell.openExternal(details.url)
        return { action: 'deny' }
    })

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
        mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    }

    setupAutoUpdater(mainWindow)
}

// IPC handler for enabling touch emulation - now just a placeholder
// We don't use enableDeviceEmulation anymore as it causes touch cursor on entire window
// Touch cursor is handled purely via JS injection in the renderer
ipcMain.handle('enable-touch-emulation', async (_event, webContentsId: number, _deviceWidth: number, _deviceHeight: number, _isMobile: boolean) => {
    console.log(`[Touch] IPC received for webContents ${webContentsId} - no device emulation needed`)
    return true
})

// IPC handler for disabling device emulation
ipcMain.handle('disable-touch-emulation', async (_event, webContentsId: number) => {
    try {
        const wc = webContents.fromId(webContentsId)
        if (!wc) return false

        wc.disableDeviceEmulation()
        return true
    } catch (error) {
        console.error('[Disable Emulation] Error:', error)
        return false
    }
})

ipcMain.handle('check-for-updates', async () => {
    if (!is.dev) {
        return autoUpdater.checkForUpdates()
    }
    return null
})

ipcMain.handle('get-app-version', () => {
    return app.getVersion()
})



app.whenReady().then(() => {
    electronApp.setAppUserModelId('com.humshakals.pro')

    app.on('browser-window-created', (_, window) => {
        optimizer.watchWindowShortcuts(window)
    })

    // Anti-bot: Normalize headers for all sessions
    app.on('session-created', (sess) => {
        sess.webRequest.onBeforeSendHeaders((details, callback) => {
            const { requestHeaders } = details

            // Remove Electron/bot fingerprints
            delete requestHeaders['Sec-Ch-Ua']
            delete requestHeaders['Sec-Ch-Ua-Mobile']
            delete requestHeaders['Sec-Ch-Ua-Platform']

            callback({ requestHeaders })
        })
    })

    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})
