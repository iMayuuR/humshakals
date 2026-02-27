import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { selectIsGlobalModalOpen, toggleGlobalModal, selectDevToolsRules, setRules } from '../store/slices/devtoolsPocket'
import { Icon } from '@iconify/react'

export const GlobalDevToolsModal = () => {
    const dispatch = useDispatch()
    const isOpen = useSelector(selectIsGlobalModalOpen)
    const rules = useSelector(selectDevToolsRules)

    // Local state for immediate typing (debounced dispatch or save button)
    const [localRules, setLocalRules] = useState(rules)

    // Sync local state when open
    useEffect(() => {
        if (isOpen) {
            setLocalRules(rules)
        }
    }, [isOpen, rules])

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') dispatch(toggleGlobalModal(false))
        }
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown)
        }
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, dispatch])

    if (!isOpen) return null

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) dispatch(toggleGlobalModal(false))
    }

    const handleSave = () => {
        dispatch(setRules(localRules))
        dispatch(toggleGlobalModal(false))
    }

    return (
        <div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-in fade-in duration-200"
            onClick={handleBackdropClick}
        >
            <div className="bg-[var(--bg-secondary)] w-full max-w-md rounded-lg shadow-xl overflow-hidden border border-[var(--border-color)]">
                <div className="p-5 border-b border-[var(--border-color)] flex justify-between items-center">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <Icon icon="ic:round-terminal" className="text-primary-500" />
                        DevTools Pocket Rules
                    </h2>
                    <button onClick={() => dispatch(toggleGlobalModal(false))} className="hover:text-red-500">
                        <Icon icon="lucide:x" width={20} />
                    </button>
                </div>

                <div className="p-6 space-y-4 text-sm">
                    <div className="space-y-1">
                        <label className="font-semibold text-muted">Console Errors (Contains text)</label>
                        <input
                            type="text"
                            placeholder="e.g. timeout, ReferenceError, API (Leave empty for ALL)"
                            className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded px-3 py-2 text-[var(--text-color)] focus:outline-none focus:border-primary-500"
                            value={localRules.consoleFilterText}
                            onChange={(e) => setLocalRules({ ...localRules, consoleFilterText: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="font-semibold text-muted">Console Log Match</label>
                        <input
                            type="text"
                            placeholder="e.g. TrackingID, 404, Payment"
                            className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded px-3 py-2 text-[var(--text-color)] focus:outline-none focus:border-primary-500"
                            value={localRules.consoleLogMatch}
                            onChange={(e) => setLocalRules({ ...localRules, consoleLogMatch: e.target.value })}
                        />
                    </div>

                    <div className="pt-2">
                        <label className="flex items-center gap-2 cursor-pointer font-semibold mb-2">
                            <input
                                type="checkbox"
                                className="w-4 h-4 text-primary-600 focus:ring-primary-500 rounded bg-gray-700 border-gray-600"
                                checked={localRules.isNetworkEnabled}
                                onChange={(e) => setLocalRules({ ...localRules, isNetworkEnabled: e.target.checked })}
                            />
                            Enable Specific Network Tracking
                        </label>

                        {localRules.isNetworkEnabled && (
                            <input
                                type="text"
                                placeholder="File name or URL chunk, e.g. analytics.js, /api/auth"
                                className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded px-3 py-2 text-[var(--text-color)] focus:outline-none focus:border-primary-500"
                                value={localRules.networkMatch}
                                onChange={(e) => setLocalRules({ ...localRules, networkMatch: e.target.value })}
                            />
                        )}
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-[var(--border-color)] flex justify-end gap-3 bg-[var(--bg-tertiary)]">
                    <button
                        onClick={() => dispatch(toggleGlobalModal(false))}
                        className="px-4 py-2 rounded font-medium border border-[var(--border-color)] hover:bg-[var(--bg-secondary)]"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="btn-cta px-4 py-2 rounded font-medium bg-blue-600 hover:bg-blue-500"
                    >
                        Save Rules
                    </button>
                </div>
            </div>
        </div>
    )
}
