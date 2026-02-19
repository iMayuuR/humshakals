import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
// import { Icon } from '@iconify/react'
import logo from '../assets/logo.png'
import { selectShowAboutModal, setShowAboutModal } from '../store/slices/ui'

export const AboutModal = () => {
    const dispatch = useDispatch()
    const isOpen = useSelector(selectShowAboutModal)
    // const modalRef = useRef<HTMLDivElement>(null)

    // const [updateStatus, setUpdateStatus] = useState<'idle' | 'checking' | 'available' | 'no-update' | 'error'>('idle')
    // const [statusMessage, setStatusMessage] = useState('')
    const [appVersion, setAppVersion] = useState('')

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                dispatch(setShowAboutModal(false))
            }
        }

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown)
            // Fetch app version
            window.api?.getAppVersion().then(setAppVersion).catch(console.error)
        }
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, dispatch])

    /* const handleCheckForUpdates = async () => {
        setUpdateStatus('checking')
        setStatusMessage('Checking for updates...')
        try {
            const result = await window.api.checkForUpdates()
            if (result) {
                // If result is returned, it means we are in dev mode or update found
                // In production with autoUpdater, events are usually handled via IPC listeners
                // But checkForUpdates returns Query result
                console.log('Update check result:', result)
            } else {
                setUpdateStatus('no-update')
                setStatusMessage('You are on the latest version.')
            }
        } catch (error) {
            console.error(error)
            setUpdateStatus('error')
            setStatusMessage('Failed to check for updates.')
        }
    } */

    if (!isOpen) return null

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            dispatch(setShowAboutModal(false))
        }
    }

    const versions = window.api?.versions || {}

    return (
        <div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-in fade-in duration-200"
            onClick={handleBackdropClick}
        >
            <div
                className="bg-[var(--bg-secondary)] w-full max-w-sm rounded-lg shadow-xl overflow-hidden border border-[var(--border-color)]"
            >
                <div className="p-6 space-y-6">
                    <div className="text-center space-y-4">
                        <div className="flex justify-center">
                            <img src={logo} alt="Humshakals" className="w-16 h-16" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Humshakals</h2>
                            <p className="text-sm text-muted">v{appVersion || '...'}</p>
                        </div>
                    </div>

                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between py-2 border-b border-[var(--border-color)]">
                            <span className="text-muted">Electron</span>
                            <span className="font-mono">{versions.electron}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-[var(--border-color)]">
                            <span className="text-muted">Chrome</span>
                            <span className="font-mono">{versions.chrome}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-[var(--border-color)]">
                            <span className="text-muted">Node.js</span>
                            <span className="font-mono">{versions.node}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-[var(--border-color)]">
                            <span className="text-muted">V8</span>
                            <span className="font-mono">{versions.v8}</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {/* <button
                            onClick={handleCheckForUpdates}
                            disabled={updateStatus === 'checking'}
                            className={`w-full py-2 px-4 rounded font-medium text-sm transition-colors flex items-center justify-center gap-2
                                ${updateStatus === 'checking'
                                    ? 'bg-[var(--bg-tertiary)] text-muted cursor-wait'
                                    : 'go-button'}`}
                        >
                            {updateStatus === 'checking' ? (
                                <>
                                    <Icon icon="eos-icons:loading" width={18} />
                                    Checking...
                                </>
                            ) : (
                                <>
                                    <Icon icon="mdi:update" width={18} />
                                    Check for Updates
                                </>
                            )}
                        </button> */}

                        {/* {statusMessage && (
                            <p className={`text-xs text-center ${updateStatus === 'error' ? 'text-red-400' : 'text-muted'}`}>
                                {statusMessage}
                            </p>
                        )} */}

                        <a
                            href="https://github.com/iMayuuR/humshakals"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full py-2 px-4 rounded font-medium text-sm text-center border border-[var(--border-color)] hover:bg-[var(--bg-tertiary)] transition-colors"
                        >
                            View on GitHub
                        </a>
                    </div>
                </div>
            </div>
        </div >
    )
}
