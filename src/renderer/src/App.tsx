import { useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ToolBar } from './components/ToolBar'
import { Previewer } from './components/Previewer'
import { DeviceManager } from './components/DeviceManager'
import { AboutModal } from './components/AboutModal'
import { UpdateNotification } from './components/UpdateNotification'
import { setIsInspecting, selectIsInspecting } from './store/slices/renderer'
import { selectColorScheme, toggleColorScheme } from './store/slices/ui'

function App() {
    const dispatch = useDispatch()
    const isInspecting = useSelector(selectIsInspecting)
    const colorScheme = useSelector(selectColorScheme)

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
        const webviews = document.querySelectorAll('webview') as NodeListOf<Electron.WebviewTag>
        const timestamp = Date.now()

        for (const wv of webviews) {
            try {
                const image = await wv.capturePage()
                const dataUrl = image.toDataURL()

                const link = document.createElement('a')
                link.href = dataUrl
                link.download = `${wv.id || 'device'}_${timestamp}.png`
                link.click()

                await new Promise(r => setTimeout(r, 100))
            } catch (err) {
                console.error('Screenshot failed:', err)
            }
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
        </div>
    )
}

export default App
