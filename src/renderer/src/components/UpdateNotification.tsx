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

    const handleInstall = async () => {
        // @ts-ignore
        await window.api?.installUpdate()
    }

    const handleViewRelease = async () => {
        // @ts-ignore
        await window.api?.openExternal('https://github.com/iMayuuR/humshakals/releases/latest')
    }

    if (state === 'idle') return null

    return (
        <div className="fixed bottom-6 right-6 z-50 w-80 bg-bg-secondary border border-border-color rounded-xl shadow-2xl p-4 space-y-3 animate-in slide-in-from-bottom-8 duration-300">
            {state === 'downloading' && (
                <>
                    <div className="flex items-center gap-2">
                        <Icon icon="eos-icons:loading" className="text-accent animate-spin" width={20} />
                        <span className="text-sm font-semibold text-text-primary">Downloading update...</span>
                    </div>
                    <div className="w-full bg-bg-tertiary rounded-full h-2">
                        <div
                            className="bg-accent h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className="text-xs text-muted font-medium">{progress}% — App will restart when ready.</p>
                </>
            )}
            {state === 'ready' && (
                <>
                    <div className="flex items-start gap-3">
                        <div className="bg-green-500/20 p-2 rounded-full flex-shrink-0 mt-0.5">
                            <Icon icon="mdi:arrow-down-bold-circle-outline" className="text-green-500" width={24} />
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-base font-bold text-text-primary">Update Ready to Install!</span>
                            <span className="text-xs text-text-secondary leading-tight">
                                A new version with bug fixes and features has been safely downloaded.
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button
                            onClick={handleInstall}
                            className="flex-1 bg-accent hover:bg-accent-hover text-white py-1.5 px-3 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                        >
                            <Icon icon="mdi:restart" width={16} />
                            Restart Now
                        </button>
                        <button
                            onClick={handleViewRelease}
                            className="flex-none bg-bg-tertiary hover:bg-btn-hover text-text-secondary py-1.5 px-3 rounded-lg text-sm font-medium transition-colors border border-border-color shadow-sm"
                            title="View Release on GitHub"
                        >
                            <Icon icon="mdi:github" width={18} />
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}
