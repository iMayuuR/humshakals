import { app, shell, BrowserWindow, session, ipcMain, dialog, webContents, WebContentsView } from 'electron'
import { join } from 'path'
import * as fs from 'fs'
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

// IPC handler for enabling device emulation via CDP
// We send Emulation.setDeviceMetricsOverride specifically to ensure cross-origin iframes
// see the emulated mobile bounds instead of the desktop screen bounds.
ipcMain.handle('enable-touch-emulation', async (_event, webContentsId: number, _deviceWidth: number, _deviceHeight: number, _isMobile: boolean) => {
    try {
        const wc = webContents.fromId(webContentsId);
        if (!wc) return false;

        try {
            if (!wc.debugger.isAttached()) {
                wc.debugger.attach('1.3');
            }
        } catch (e) {
            console.log('[Emulation] Debugger attach error:', e);
        }

        // 1. Force native bounds onto the rendering engine (fixes CORS iframe widths)
        await wc.debugger.sendCommand('Emulation.setDeviceMetricsOverride', {
            width: _deviceWidth,
            height: _deviceHeight,
            deviceScaleFactor: 0,
            mobile: _isMobile,
            fitWindow: false
        })

        console.log(`[Emulation] CDP metrics applied for webContents ${webContentsId} (${_deviceWidth}x${_deviceHeight})`);
        return true;
    } catch (error) {
        console.error('[Emulation] Error:', error)
        return false
    }
})

// IPC handler for toggling the touch cursor (to prevent app-wide bleed)
ipcMain.handle('toggle-touch-cursor', async (_event, webContentsId: number, enabled: boolean) => {
    try {
        const wc = webContents.fromId(webContentsId);
        if (!wc) return false;

        if (wc.debugger.isAttached()) {
            await wc.debugger.sendCommand('Emulation.setEmitTouchEventsForMouse', {
                enabled: enabled,
                configuration: 'mobile'
            });
            await wc.debugger.sendCommand('Emulation.setTouchEmulationEnabled', {
                enabled: enabled,
                maxTouchPoints: enabled ? 5 : 1
            });
        }
        return true;
    } catch (error) {
        return false;
    }
})

// IPC handler for toggling docked/undocked DevTools on a specific webContents
ipcMain.handle('open-devtools', async (_event, webContentsId: number, isDocked: boolean) => {
    try {
        const wc = webContents.fromId(webContentsId);
        if (!wc) return false;

        if (wc.isDevToolsOpened()) {
            wc.closeDevTools();
        }

        wc.openDevTools({ mode: isDocked ? 'right' : 'detach' });
        return true;
    } catch (error) {
        console.error('[DevTools] Error opening devtools:', error);
        return false;
    }
})

// IPC handler for saving screenshots
ipcMain.handle('save-screenshot', async (_event, filename: string, dataUrl: string) => {
    try {
        const picturesPath = app.getPath('pictures')
        const humshakalsPath = join(picturesPath, 'humshakals')

        if (!fs.existsSync(humshakalsPath)) {
            fs.mkdirSync(humshakalsPath, { recursive: true })
        }

        const filePath = join(humshakalsPath, filename)
        // Extract base64 payload from "data:image/png;base64,....."
        const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, "")
        const buffer = Buffer.from(base64Data, 'base64')

        await fs.promises.writeFile(filePath, buffer)
        return filePath
    } catch (error) {
        console.error('[Screenshot] Error saving screenshot:', error)
        throw error
    }
})


// IPC handler for disabling device emulation completely
ipcMain.handle('disable-touch-emulation', async (_event, webContentsId: number) => {
    try {
        const wc = webContents.fromId(webContentsId);
        if (!wc) return false;

        if (wc.debugger.isAttached()) {
            await wc.debugger.sendCommand('Emulation.setEmitTouchEventsForMouse', { enabled: false });
            await wc.debugger.sendCommand('Emulation.setTouchEmulationEnabled', { enabled: false, maxTouchPoints: 1 });
            wc.debugger.detach();
        }
        return true;
    } catch (error) {
        console.error('[Disable Emulation] Error:', error);
        return false;
    }
})

ipcMain.handle('check-for-updates', async () => {
    if (!is.dev) {
        try {
            const result = await autoUpdater.checkForUpdates()
            // Return only essential data, as the full result contains non-serializable objects (cancellationToken)
            return result?.updateInfo || null
        } catch (error) {
            console.error('Error checking for updates:', error)
            // Return null or throw a string error if preferred, but null handles "no update" gracefully? 
            // Actually, if it errors, we might want the renderer to know. 
            // But let's keep it simple: return null on error for now to avoid crashing, or let it throw.
            // Better: throw so the UI shows error, but ensure it's a string.
            throw error instanceof Error ? error.message : String(error)
        }
    }
    return null
})

ipcMain.handle('get-app-version', () => {
    return app.getVersion()
})

ipcMain.handle('install-update', () => {
    autoUpdater.quitAndInstall()
})

ipcMain.handle('open-external', (_event, url: string) => {
    shell.openExternal(url)
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
