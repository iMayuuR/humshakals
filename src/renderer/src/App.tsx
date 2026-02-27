import { useEffect, useCallback, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Icon } from '@iconify/react'
import { ToolBar } from './components/ToolBar'
import { Previewer } from './components/Previewer'
import { DeviceManager } from './components/DeviceManager'
import { AboutModal } from './components/AboutModal'
import { GlobalDevToolsModal } from './components/GlobalDevToolsModal'
import { UpdateNotification } from './components/UpdateNotification'
import { setIsInspecting, selectIsInspecting } from './store/slices/renderer'
import { selectColorScheme, toggleColorScheme } from './store/slices/ui'
import { loadCustomDevicesAsync } from './store/slices/devices'
import { loadDevToolsRulesAsync } from './store/slices/devtoolsPocket'
import { getFormattedDate, getCleanDomain, cleanString } from './utils/helpers'

interface ToastItem {
    id: number
    message: string
    type: 'error' | 'log' | 'network' | 'success'
    fading: boolean
}

const TOAST_COLORS: Record<string, { bg: string; border: string; icon: string }> = {
    error: { bg: 'rgba(220, 38, 38, 0.92)', border: 'rgba(248, 113, 113, 0.6)', icon: 'ic:round-error-outline' },
    log: { bg: 'rgba(202, 138, 4, 0.92)', border: 'rgba(250, 204, 21, 0.6)', icon: 'ic:round-article' },
    network: { bg: 'rgba(37, 99, 235, 0.92)', border: 'rgba(96, 165, 250, 0.6)', icon: 'ic:round-wifi' },
    success: { bg: 'rgba(22, 163, 74, 0.92)', border: 'rgba(74, 222, 128, 0.6)', icon: 'mdi:check-circle' },
}

const MAX_TOASTS = 5

function App() {
    const dispatch = useDispatch()
    const isInspecting = useSelector(selectIsInspecting)
    const colorScheme = useSelector(selectColorScheme)
    const [toasts, setToasts] = useState<ToastItem[]>([])
    const toastIdRef = useRef(0)

    // Global Toast Listener — supports stacking
    useEffect(() => {
        const handleToast = (e: any) => {
            // Support both old (string) and new ({message, type}) format
            const raw = e.detail
            const message = typeof raw === 'string' ? raw : raw.message
            const type = typeof raw === 'string' ? 'success' : (raw.type || 'success')

            const id = ++toastIdRef.current
            setToasts(prev => [...prev.slice(-(MAX_TOASTS - 1)), { id, message, type, fading: false }])

            // Start fade-out after 2.5s
            setTimeout(() => {
                setToasts(prev => prev.map(t => t.id === id ? { ...t, fading: true } : t))
            }, 2500)

            // Remove after 3.5s
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id))
            }, 3500)
        }
        window.addEventListener('app-toast', handleToast)
        return () => window.removeEventListener('app-toast', handleToast)
    }, [])

    // Load custom devices and devtools rules from electron-store on boot
    useEffect(() => {
        // @ts-ignore
        dispatch(loadCustomDevicesAsync())
        // @ts-ignore
        dispatch(loadDevToolsRulesAsync())
    }, [dispatch])

    // Apply theme to document
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', colorScheme)
    }, [colorScheme])

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ctrl+I - Toggle Inspect Mode
            if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
                e.preventDefault()
                dispatch(setIsInspecting(!isInspecting))
            }

            // Ctrl+R / F5 - Reload All
            if (((e.ctrlKey || e.metaKey) && e.key === 'r') || e.key === 'F5') {
                e.preventDefault()
                handleReloadAll()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [dispatch, isInspecting])

    const handleReloadAll = useCallback(() => {
        const webviews = document.querySelectorAll('webview') as NodeListOf<Electron.WebviewTag>
        webviews.forEach(wv => wv.reload())
    }, [])

    const handleGoBack = useCallback(() => {
        const webviews = document.querySelectorAll('webview') as NodeListOf<Electron.WebviewTag>
        webviews.forEach(wv => {
            if (wv.canGoBack()) wv.goBack()
        })
    }, [])

    const handleGoForward = useCallback(() => {
        const webviews = document.querySelectorAll('webview') as NodeListOf<Electron.WebviewTag>
        webviews.forEach(wv => {
            if (wv.canGoForward()) wv.goForward()
        })
    }, [])

    const handleScreenshotAll = useCallback(async () => {
        const webviews = Array.from(document.querySelectorAll('webview')) as Electron.WebviewTag[];
        const dateStr = getFormattedDate();

        let successCount = 0;

        for (const wv of webviews) {
            try {
                const image = await wv.capturePage()
                const dataUrl = image.toDataURL()

                const rawDeviceName = wv.getAttribute('data-device-name') || wv.id || 'device'
                const dName = cleanString(rawDeviceName)
                const domain = getCleanDomain(wv.getURL())

                const filename = `${dName}-${domain}-${dateStr}.png`;
                await window.api.saveScreenshot(filename, dataUrl);
                successCount++;

            } catch (err) {
                console.error('Screenshot failed for', wv.id, err)
            }
        }

        if (successCount > 0) {
            window.dispatchEvent(new CustomEvent('app-toast', {
                detail: `Saved ${successCount} screenshots to Pictures/humshakals/`
            }))
        }
    }, [])

    const handleToggleTheme = useCallback(() => {
        dispatch(toggleColorScheme())
    }, [dispatch])

    return (
        <div className="h-screen flex flex-col bg-surface-dark">
            {/* Main Toolbar */}
            <ToolBar
                onReloadAll={handleReloadAll}
                onGoBack={handleGoBack}
                onGoForward={handleGoForward}
                onScreenshotAll={handleScreenshotAll}
                onToggleTheme={handleToggleTheme}
                isDarkMode={colorScheme === 'dark'}
            />

            {/* Device Previewer with embedded webviews */}
            <main className="flex-1 overflow-hidden">
                <Previewer />
            </main>

            {/* Modals & Overlays */}
            <DeviceManager />
            <AboutModal />
            <GlobalDevToolsModal />
            <UpdateNotification />

            {/* Global Stacking Toast Notifications */}
            <div className="toast-container">
                {toasts.map((toast) => {
                    const colors = TOAST_COLORS[toast.type] || TOAST_COLORS.success
                    return (
                        <div
                            key={toast.id}
                            className={`toast-item ${toast.fading ? 'fading' : ''}`}
                            style={{
                                backgroundColor: colors.bg,
                                borderColor: colors.border,
                            }}
                        >
                            <Icon icon={colors.icon} width={18} />
                            <span>{toast.message}</span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default App
