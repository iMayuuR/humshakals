import { Icon } from '@iconify/react'
import { Button } from '../../Button'

interface DeviceToolbarProps {
    onRefresh: () => void
    onQuickScreenshot: () => void
    onToggleMirroring: () => void
    onOpenDevtools: () => void
    onRotate: () => void
    onScrollToTop: () => void
    isMirroringOff: boolean
    canRotate: boolean
    isRotated: boolean
    isScreenshotLoading: boolean
}

export const DeviceToolbar = ({
    onRefresh,
    onQuickScreenshot,
    onToggleMirroring,
    onOpenDevtools,
    onRotate,
    onScrollToTop,
    isMirroringOff,
    canRotate,
    isRotated,
    isScreenshotLoading
}: DeviceToolbarProps) => {
    return (
        <div className="flex items-center gap-0.5 mb-1 px-0.5">
            {/* Refresh */}
            <Button onClick={onRefresh} title="Refresh This View">
                <Icon icon="ic:round-refresh" width={16} />
            </Button>

            {/* Quick Screenshot */}
            <Button
                onClick={onQuickScreenshot}
                isLoading={isScreenshotLoading}
                title="Quick Screenshot"
            >
                <div className="relative w-4 h-4">
                    <Icon icon="ic:outline-photo-camera" className="absolute top-0 left-0" width={16} />
                    <Icon icon="clarity:lightning-solid" className="absolute -top-0.5 -right-0.5" width={8} />
                </div>
            </Button>



            {/* Toggle Event Mirroring */}
            <Button
                onClick={onToggleMirroring}
                isActive={isMirroringOff}
                title={isMirroringOff ? "Enable Event Mirroring" : "Disable Event Mirroring"}
            >
                <Icon icon="fluent:plug-disconnected-24-regular" width={16} />
            </Button>

            {/* DevTools */}
            <Button onClick={onOpenDevtools} title="Open DevTools">
                <Icon icon="ic:round-code" width={16} />
            </Button>

            {/* Rotate */}
            <Button
                onClick={onRotate}
                disabled={!canRotate}
                title={canRotate ? "Rotate This Device" : "Rotation not available for non-mobile devices"}
            >
                <Icon
                    icon={isRotated ? 'mdi:phone-rotate-portrait' : 'mdi:phone-rotate-landscape'}
                    width={16}
                />
            </Button>

            {/* Scroll to Top */}
            <Button onClick={onScrollToTop} title="Scroll to Top">
                <Icon icon="ic:baseline-arrow-upward" width={16} />
            </Button>

            {/* Spacer */}
        </div>
    )
}
