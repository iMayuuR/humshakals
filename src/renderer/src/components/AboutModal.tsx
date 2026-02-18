import { useEffect, useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Icon } from '@iconify/react'
import logo from '../assets/logo.png'
import { selectShowAboutModal, setShowAboutModal } from '../store/slices/ui'

export const AboutModal = () => {
    const dispatch = useDispatch()
    const isOpen = useSelector(selectShowAboutModal)
    const modalRef = useRef<HTMLDivElement>(null)

    const [updateStatus, setUpdateStatus] = useState<'idle' | 'checking' | 'available' | 'no-update' | 'error'>('idle')
    const [statusMessage, setStatusMessage] = useState('')
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

    const handleCheckForUpdates = async () => {
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
    }

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
                ref={modalRef}
                className="modal-content rounded-lg shadow-2xl w-[400px] overflow-hidden animate-in zoom-in-95 duration-200"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)] bg-[var(--bg-tertiary)]">
                    <div className="flex items-center gap-2">
                        <Icon icon="mdi:information-slab-circle" width={20} className="text-[var(--accent)]" />
                        <h2 className="text-base font-semibold text-heading">About</h2>
                    </div>
                    <button
                        onClick={() => dispatch(setShowAboutModal(false))}
                        className="btn-icon"
                    >
                        <Icon icon="ic:round-close" width={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4">
                            <img src={logo} alt="Humshakals Logo" className="w-full h-full object-contain drop-shadow-xl" />
                        </div>
                        <h3 className="text-lg font-bold text-heading">Humshakals</h3>
                        <p className="text-xs text-muted mb-2">The Ultimate Responsive Design Browser</p>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--bg-tertiary)] rounded-full text-xs font-mono text-secondary-themed border border-[var(--border-color)]">
                            v{appVersion || '...'}
                        </div>
                    </div>

                    <div className="bg-[var(--bg-tertiary)] rounded-lg p-4 border border-[var(--border-color)]">
                        <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3 text-center">System Information</h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-2">
                                <span className="text-muted">Electron</span>
                                <span className="font-mono text-secondary-themed">{versions.electron || 'Unknown'}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-2">
                                <span className="text-muted">Chrome</span>
                                <span className="font-mono text-secondary-themed">{versions.chrome || 'Unknown'}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-2">
                                <span className="text-muted">Node.js</span>
                                <span className="font-mono text-secondary-themed">{versions.node || 'Unknown'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted">V8</span>
                                <span className="font-mono text-secondary-themed">{versions.v8 || 'Unknown'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button
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
                        </button>

                        {statusMessage && (
                            <p className={`text-xs text-center ${updateStatus === 'error' ? 'text-red-400' : 'text-muted'}`}>
                                {statusMessage}
                            </p>
                        )}

                        <div className="flex justify-center pt-2">
                            <a
                                href="https://github.com/iMayuuR/humshakals"
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-muted hover:text-heading flex items-center gap-1 transition-colors"
                            >
                                <Icon icon="mdi:github" width={14} />
                                View on GitHub
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}
