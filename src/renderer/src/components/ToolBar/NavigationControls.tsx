import { Icon } from '@iconify/react'
import { Button } from '../Button'

interface NavigationControlsProps {
    onBack: () => void
    onForward: () => void
    onReload: () => void
    canGoBack?: boolean
    canGoForward?: boolean
}

export const NavigationControls = ({
    onBack,
    onForward,
    onReload,
    canGoBack = true,
    canGoForward = true
}: NavigationControlsProps) => {
    return (
        <div className="flex items-center gap-0.5">
            <Button onClick={onBack} disabled={!canGoBack} title="Go Back">
                <Icon icon="ic:round-arrow-back" width={18} />
            </Button>
            <Button onClick={onForward} disabled={!canGoForward} title="Go Forward">
                <Icon icon="ic:round-arrow-forward" width={18} />
            </Button>
            <Button onClick={onReload} title="Reload All (Ctrl+R)">
                <Icon icon="ic:round-refresh" width={18} />
            </Button>
        </div>
    )
}
