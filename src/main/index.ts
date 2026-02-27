import { app, shell, BrowserWindow, session, ipcMain, dialog, webContents, WebContentsView } from 'electron'
import * as path from 'path'
import { join } from 'path'
import * as fs from 'fs'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { autoUpdater, UpdateInfo, ProgressInfo } from 'electron-updater'
// @ts-ignore
import icon from '../../resources/icon.png?asset'

// Configure auto-updater
autoUpdater.autoDownload = true
autoUpdater.autoInstallOnAppQuit = true

// SECURITY: Allowed protocols for external URLs (no data:/blob: to prevent arbitrary JS execution)
const ALLOWED_PROTOCOLS = new Set(['http:', 'https:', 'mailto:'])

// SECURITY: Safe key pattern for fs-based store (prevents path traversal)
const SAFE_STORE_KEY = /^[a-zA-Z0-9_-]+$/

const isValidProtocol = (urlStr: string): boolean => {
    try {
        return ALLOWED_PROTOCOLS.has(new URL(urlStr).protocol)
    } catch {
        return false
    }
}

// Anti-bot switches — SECURITY NOTE: These disable browser security features
// (site isolation, COOP, SameSite cookies) intentionally because this app
// is a responsive design tester that needs to load and inspect cross-origin content.
// These are NOT safe for general browsing apps.
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

    // SECURITY: Only grant permissions actually needed for responsive testing
    const ALLOWED_PERMISSIONS = new Set(['clipboard-read', 'clipboard-sanitized-write'])
    deviceSession.setPermissionRequestHandler((_webContents, permission, callback) => {
        callback(ALLOWED_PERMISSIONS.has(permission))
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
        ...(process.platform === 'linux' ? { icon } : { icon }),
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
        if (isValidProtocol(details.url)) {
            shell.openExternal(details.url)
        } else {
            console.log(`[Security] Blocked attempt to open external URL with disallowed protocol: ${details.url}`)
        }
        return { action: 'deny' }
    })

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
        mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    }

    // Network monitoring: attach to each device webview's session dynamically
    // Skip the main window (defaultSession), attach to all other sessions (device webviews)
    const monitoredSessions = new Set<number>()

    app.on('web-contents-created', (_, contents) => {
        contents.on('did-finish-load', () => {
            try {
                // Skip if already monitored or if it's the main window session
                if (monitoredSessions.has(contents.id)) return
                const sess = contents.session
                if (sess === session.defaultSession) return

                monitoredSessions.add(contents.id)

                sess.webRequest.onCompleted((details) => {
                    if (mainWindow && !mainWindow.isDestroyed()) {
                        mainWindow.webContents.send('network-request-completed', {
                            url: details.url,
                            statusCode: details.statusCode,
                            method: details.method,
                            resourceType: details.resourceType,
                            fromCache: details.fromCache,
                            webContentsId: details.webContentsId
                        })
                    }
                })
                console.log(`[Network Monitor] Attached to webContents #${contents.id}`)
            } catch { /* ignore */ }
        })
    })

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
ipcMain.handle('open-devtools', async (_event, webContentsId: number, isDocked: boolean, deviceName?: string) => {
    try {
        const wc = webContents.fromId(webContentsId);
        if (!wc) return false;

        if (wc.isDevToolsOpened()) {
            wc.closeDevTools();
            return true;
        }

        wc.openDevTools({ mode: isDocked ? 'right' : 'detach', title: deviceName ? `DevTools - ${deviceName}` : undefined });
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

        // SECURITY: Strip path traversal from filename
        const safeName = path.basename(filename)
        const filePath = join(humshakalsPath, safeName)
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

// IPC handler for downloading DevTools Pocket bug reports
ipcMain.handle('save-bug-report', async (_event, filename: string, content: string) => {
    try {
        const docsPath = app.getPath('documents')
        const humshakalsPath = join(docsPath, 'humshakals')

        if (!fs.existsSync(humshakalsPath)) {
            fs.mkdirSync(humshakalsPath, { recursive: true })
        }

        // SECURITY: Strip path traversal from filename
        const safeName = path.basename(filename)
        const filePath = join(humshakalsPath, safeName)
        await fs.promises.writeFile(filePath, content, 'utf-8')
        return filePath
    } catch (error) {
        console.error('[Bug Report] Error saving report:', error)
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

ipcMain.handle('open-external', (_event, urlStr: string) => {
    if (isValidProtocol(urlStr)) {
        shell.openExternal(urlStr)
    } else {
        console.log(`[Security] IPC blocked opening external URL: ${urlStr}`)
    }
})

// Simple JSON storage using fs to avoid electron-store ESM build issues
ipcMain.handle('store-get', async (_event, key: string) => {
    try {
        // SECURITY: Prevent path traversal via key
        if (!SAFE_STORE_KEY.test(key)) {
            console.log(`[Security] Rejected unsafe store key: ${key}`)
            return null
        }
        const userDataPath = app.getPath('userData')
        const filePath = path.join(userDataPath, `${key}.json`)
        if (fs.existsSync(filePath)) {
            const data = await fs.promises.readFile(filePath, 'utf-8')
            return JSON.parse(data)
        }
        return null
    } catch (e) {
        console.error('Failed to read store', e)
        return null
    }
})

ipcMain.handle('store-set', async (_event, key: string, data: any) => {
    try {
        // SECURITY: Prevent path traversal via key
        if (!SAFE_STORE_KEY.test(key)) {
            console.log(`[Security] Rejected unsafe store key: ${key}`)
            return false
        }
        const userDataPath = app.getPath('userData')
        const filePath = path.join(userDataPath, `${key}.json`)
        await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')
        return true
    } catch (e) {
        console.error('Failed to write store', e)
        return false
    }
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

    // Global WebContents Protection (covers webviews too)
    // Uses module-level isValidProtocol() and ALLOWED_PROTOCOLS
    app.on('web-contents-created', (_, contents) => {
        // Intercept window open events (like target="_blank" inside webviews)
        contents.setWindowOpenHandler((details) => {
            if (isValidProtocol(details.url)) {
                shell.openExternal(details.url)
            } else {
                console.log(`[Security] WebContents blocked window open: ${details.url}`)
            }
            return { action: 'deny' }
        })

        // Intercept navigations (like location.href = 'gmsg://...' inside webviews)
        contents.on('will-navigate', (event, url) => {
            if (!isValidProtocol(url)) {
                console.log(`[Security] WebContents blocked navigation: ${url}`)
                event.preventDefault()
            }
        })

        // Also block sub-frame navigations (iframes trying to open custom protocols)
        contents.on('will-frame-navigate' as any, (event: any) => {
            const url = event?.url
            if (url && !isValidProtocol(url)) {
                console.log(`[Security] WebContents blocked frame navigation: ${url}`)
                event.preventDefault()
            }
        })
    })

    // Block known spam/ad custom protocols at the app level
    const BLOCKED_PROTOCOLS = ['gmsg', 'intent', 'market', 'fb', 'whatsapp', 'tg', 'viber']
    for (const proto of BLOCKED_PROTOCOLS) {
        try {
            // Prevent the OS from handling these protocols
            app.removeAsDefaultProtocolClient(proto)
        } catch { /* ignore */ }
    }
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})
