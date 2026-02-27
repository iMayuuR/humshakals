import { Icon } from '@iconify/react'
import { useDispatch, useSelector } from 'react-redux'
import {
    selectIsInspecting,
    selectRotateDevices,
    selectIsCapturingScreenshot,
    setIsInspecting,
    setRotateDevices,
    setAddress,
    selectAddress
} from '../../store/slices/renderer'
import { toggleAboutModal } from '../../store/slices/ui'
import { toggleGlobalModal } from '../../store/slices/devtoolsPocket'
import { NavigationControls } from './NavigationControls'
import { AddressBar } from './AddressBar'
import { PreviewSuiteSelector } from './PreviewSuiteSelector'
import { Button, Divider } from '../Button'

interface ToolBarProps {
    onReloadAll: () => void
    onGoBack: () => void
    onGoForward: () => void
    onScreenshotAll: () => void
    onToggleTheme?: () => void
    isDarkMode?: boolean
}

export const ToolBar = ({
    onReloadAll,
    onGoBack,
    onGoForward,
    onScreenshotAll,
    onToggleTheme,
    isDarkMode = true
}: ToolBarProps) => {
    const dispatch = useDispatch()
    const address = useSelector(selectAddress)
    const isInspecting = useSelector(selectIsInspecting)
    const rotateDevices = useSelector(selectRotateDevices)
    const isCapturingScreenshot = useSelector(selectIsCapturingScreenshot)

    const handleNavigate = (url: string) => {
        dispatch(setAddress(url))
    }

    const handleRotateAll = () => {
        dispatch(setRotateDevices(!rotateDevices))
    }

    const handleInspect = () => {
        dispatch(setIsInspecting(!isInspecting))
    }

    return (
        <div className="main-toolbar h-12 flex items-center justify-between px-3">

            {/* Left: Navigation */}
            <NavigationControls
                onBack={onGoBack}
                onForward={onGoForward}
                onReload={onReloadAll}
            />

            {/* Center: Address Bar */}
            <AddressBar
                address={address}
                onNavigate={handleNavigate}
                onReload={onReloadAll}
            />

            {/* Right: Actions */}
            <div className="flex items-center gap-1">
                <Button
                    onClick={handleRotateAll}
                    isActive={rotateDevices}
                    title="Rotate All Devices"
                >
                    <Icon
                        icon={rotateDevices ? 'mdi:phone-rotate-portrait' : 'mdi:phone-rotate-landscape'}
                        width={18}
                    />
                </Button>

                <Button
                    onClick={handleInspect}
                    isActive={isInspecting}
                    title="Inspect Elements (Ctrl+I)"
                >
                    <Icon icon="lucide:inspect" width={18} />
                </Button>

                <Button
                    onClick={onScreenshotAll}
                    isLoading={isCapturingScreenshot}
                    title="Screenshot All Devices"
                >
                    <Icon icon="lucide:camera" width={18} />
                </Button>

                <Divider />

                {/* DevTools Pocket Setting */}
                <Button
                    onClick={() => dispatch(toggleGlobalModal())}
                    title="DevTools Pocket Settings"
                >
                    <Icon icon="ic:round-terminal" width={18} />
                </Button>

                <Divider />

                {/* Theme Toggle */}
                <Button
                    onClick={onToggleTheme}
                    title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                    <Icon
                        icon={isDarkMode ? 'lucide:sun' : 'lucide:moon'}
                        width={18}
                    />
                </Button>

                <Divider />

                <Divider />

                <Button
                    onClick={() => dispatch(toggleAboutModal())}
                    title="About"
                >
                    <Icon icon="mdi:information-slab-circle-outline" width={18} />
                </Button>

                <Divider />

                <PreviewSuiteSelector />
            </div>
        </div>
    )
}
