import { useEffect, useState } from 'react'
import { Icon } from '@iconify/react'

type UpdateState = 'idle' | 'downloading' | 'ready'

export const UpdateNotification = () => {
    const [state, setState] = useState<UpdateState>('idle')
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        const removeStatusListener = window.api?.onUpdateStatus((status) => {
            if (status === 'downloading') {
                setState('downloading')
            }
        })

        const removeProgressListener = window.api?.onUpdateProgress((percent) => {
            setProgress(Math.round(percent))
            if (percent >= 100) {
                setState('ready')
            }
        })

        return () => {
            removeStatusListener?.()
            removeProgressListener?.()
        }
    }, [])

    if (state === 'idle') return null

    return (
        <div className="fixed bottom-4 right-4 z-50 w-72 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg shadow-2xl p-4 space-y-3 animate-in slide-in-from-bottom-4 duration-300">
            {state === 'downloading' && (
                <>
                    <div className="flex items-center gap-2">
                        <Icon icon="eos-icons:loading" className="text-[var(--accent)] animate-spin" width={18} />
                        <span className="text-sm font-medium">Downloading update...</span>
                    </div>
                    <div className="w-full bg-[var(--bg-tertiary)] rounded-full h-1.5">
                        <div
                            className="bg-[var(--accent)] h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className="text-xs text-muted">{progress}% — App will restart when ready.</p>
                </>
            )}
            {state === 'ready' && (
                <div className="flex items-center gap-2">
                    <Icon icon="mdi:check-circle" className="text-green-400" width={18} />
                    <span className="text-sm font-medium">Update ready! Restart to apply.</span>
                </div>
            )}
        </div>
    )
}
