import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { selectShowShortcutsModal, setShowShortcutsModal } from '../store/slices/ui'

export const ShortcutsModal = () => {
    const dispatch = useDispatch()
    const isOpen = useSelector(selectShowShortcutsModal)
    const [isMac, setIsMac] = useState(false)

    useEffect(() => {
        const platform = window.api?.platform || navigator.platform || ''
        setIsMac(platform.toLowerCase().includes('mac'))
        
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') dispatch(setShowShortcutsModal(false))
        }
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown)
        }
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, dispatch])

    if (!isOpen) return null

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) dispatch(setShowShortcutsModal(false))
    }

    const CtrlKey = isMac ? '⌘' : 'Ctrl'
    const AltKey = isMac ? '⌥' : 'Alt'
    const ShiftKey = isMac ? '⇧' : 'Shift'

    const Kbd = ({ children }: { children: React.ReactNode }) => (
        <kbd className="px-1.5 py-0.5 text-xs font-mono bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded text-[var(--text-primary)] shadow-[0_2px_0_var(--border-color)]">
            {children}
        </kbd>
    )

    const ShortcutRow = ({ label, keys }: { label: string, keys: string[] }) => (
        <div className="flex justify-between items-center py-2 border-b border-[var(--border-color)] last:border-0">
            <span className="text-sm text-[var(--text-primary)]">{label}</span>
            <div className="flex items-center gap-1">
                {keys.map((key, index) => (
                    <div key={index} className="flex items-center gap-1">
                        <Kbd>{key}</Kbd>
                        {index < keys.length - 1 && <span className="text-[var(--text-muted)] text-xs">+</span>}
                    </div>
                ))}
            </div>
        </div>
    )

    return (
        <div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-in fade-in duration-200"
            onClick={handleBackdropClick}
        >
            <div className="bg-[var(--bg-secondary)] w-full max-w-md rounded-lg shadow-xl overflow-hidden border border-[var(--border-color)] max-h-[90vh] flex flex-col">
                <div className="overflow-y-auto p-6 space-y-6">
                    <div>
                        <h3 className="text-lg font-medium text-[var(--text-primary)] mb-3 pb-2 border-b border-[var(--border-color)]">General Shortcuts</h3>
                        <div className="space-y-1">
                            <ShortcutRow label="Back" keys={[AltKey, 'left']} />
                            <ShortcutRow label="Bookmark" keys={[CtrlKey, 'D']} />
                            <ShortcutRow label="Delete All" keys={[CtrlKey, AltKey, 'del']} />
                            <ShortcutRow label="Delete Cache" keys={[CtrlKey, AltKey, 'Z']} />
                            <ShortcutRow label="Delete Cookies" keys={[CtrlKey, AltKey, 'A']} />
                            <ShortcutRow label="Delete Storage" keys={[CtrlKey, AltKey, 'Q']} />
                            <ShortcutRow label="Edit Url" keys={[CtrlKey, 'L']} />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-medium text-[var(--text-primary)] mb-3 pb-2 border-b border-[var(--border-color)]">Previewer Shortcuts</h3>
                        <div className="space-y-1">
                            <ShortcutRow label="Forward" keys={[AltKey, 'right']} />
                            <ShortcutRow label="Hard Reload" keys={[CtrlKey, ShiftKey, 'R']} />
                            <ShortcutRow label="Preview Layout" keys={[CtrlKey, ShiftKey, 'L']} />
                            <ShortcutRow label="Reload" keys={[CtrlKey, 'R']} />
                            <ShortcutRow label="Rotate All" keys={[CtrlKey, AltKey, 'R']} />
                            <ShortcutRow label="Screenshot All" keys={[CtrlKey, 'S']} />
                            <ShortcutRow label="Theme" keys={[CtrlKey, 'T']} />
                            <ShortcutRow label="Toggle Rulers" keys={[AltKey, 'R']} />
                            <ShortcutRow label="Zoom In" keys={[CtrlKey, '=']} />
                            <ShortcutRow label="Zoom Out" keys={[CtrlKey, '-']} />
                        </div>
                    </div>
                </div>
                
                <div className="p-4 flex justify-end">
                    <button 
                        onClick={() => dispatch(setShowShortcutsModal(false))}
                        className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}
