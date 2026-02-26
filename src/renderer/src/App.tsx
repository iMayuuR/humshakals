import { useEffect, useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Icon } from '@iconify/react'
import { ToolBar } from './components/ToolBar'
import { Previewer } from './components/Previewer'
import { DeviceManager } from './components/DeviceManager'
import { AboutModal } from './components/AboutModal'
import { UpdateNotification } from './components/UpdateNotification'
import { setIsInspecting, selectIsInspecting } from './store/slices/renderer'
import { selectColorScheme, toggleColorScheme } from './store/slices/ui'
import { getFormattedDate, getCleanDomain, cleanString } from './utils/helpers'

function App() {
    const dispatch = useDispatch()
    const isInspecting = useSelector(selectIsInspecting)
    const colorScheme = useSelector(selectColorScheme)
    const [toastMsg, setToastMsg] = useState<string | null>(null)

    // Global Toast Listener
    useEffect(() => {
        const handleToast = (e: any) => {
            setToastMsg(e.detail)
            setTimeout(() => setToastMsg(null), 3500)
        }
        window.addEventListener('app-toast', handleToast)
        return () => window.removeEventListener('app-toast', handleToast)
    }, [])

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

            {/* Device Manager Modal */}
            <DeviceManager />
            <AboutModal />
            <UpdateNotification />

            {/* Global Toast Notification Overlay */}
            {toastMsg && (
                <div className="fixed bottom-6 right-1/2 translate-x-1/2 z-[100] bg-green-600/90 backdrop-blur border border-green-500 text-white px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-5 fade-in duration-300">
                    <Icon icon="mdi:check-circle" width={20} className="text-white" />
                    <span className="text-sm font-medium tracking-wide">{toastMsg}</span>
                </div>
            )}
        </div>
    )
}

export default App
