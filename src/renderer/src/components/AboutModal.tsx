import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import logo from '../assets/logo.png'
import { selectShowAboutModal, setShowAboutModal } from '../store/slices/ui'

export const AboutModal = () => {
    const dispatch = useDispatch()
    const isOpen = useSelector(selectShowAboutModal)
    const [appVersion, setAppVersion] = useState('')

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') dispatch(setShowAboutModal(false))
        }
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown)
            window.api?.getAppVersion().then(setAppVersion).catch(console.error)
        }
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, dispatch])

    if (!isOpen) return null

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) dispatch(setShowAboutModal(false))
    }

    const versions = window.api?.versions || {}

    return (
        <div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-in fade-in duration-200"
            onClick={handleBackdropClick}
        >
            <div className="bg-[var(--bg-secondary)] w-full max-w-sm rounded-lg shadow-xl overflow-hidden border border-[var(--border-color)]">
                <div className="p-6 space-y-6">
                    <div className="text-center space-y-3">
                        <div className="flex justify-center">
                            <img src={logo} alt="Humshakals" className="w-16 h-16" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Humshakals</h2>
                            <p className="text-sm text-muted">v{appVersion || '...'}</p>
                        </div>
                    </div>

                    <div className="space-y-2 text-sm">
                        {[
                            ['Electron', versions.electron],
                            ['Chrome', versions.chrome],
                            ['Node.js', versions.node],
                            ['V8', versions.v8],
                        ].map(([label, val]) => (
                            <div key={label} className="flex justify-between py-2 border-b border-[var(--border-color)]">
                                <span className="text-muted">{label}</span>
                                <span className="font-mono">{val || '—'}</span>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-2">
                        <p className="text-xs text-center text-muted">Updates are downloaded automatically in background.</p>
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
        </div>
    )
}
