import { useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { selectActiveDevices } from '../../store/slices/devices'
import {
    selectZoomFactor,
    setZoomFactor,
    setAddress,
    selectIsGlobalTouchEnabled,
    setIsGlobalTouchEnabled
} from '../../store/slices/renderer'
import { DevicePreview } from './Device'
import { Icon } from '@iconify/react'

export const Previewer = () => {
    const dispatch = useDispatch()
    const devices = useSelector(selectActiveDevices)
    const zoomFactor = useSelector(selectZoomFactor)
    const isTouchEnabled = useSelector(selectIsGlobalTouchEnabled)

    const handleNavigate = useCallback((url: string) => {
        dispatch(setAddress(url))
    }, [dispatch])

    const zoomLevels = [0.25, 0.33, 0.5, 0.67, 0.75, 1.0]
    const currentZoomIndex = zoomLevels.findIndex(z => z >= zoomFactor)

    const handleZoomIn = () => {
        const nextIndex = Math.min(currentZoomIndex + 1, zoomLevels.length - 1)
        dispatch(setZoomFactor(zoomLevels[nextIndex]))
    }

    const handleZoomOut = () => {
        const prevIndex = Math.max(currentZoomIndex - 1, 0)
        dispatch(setZoomFactor(zoomLevels[prevIndex]))
    }

    if (devices.length === 0) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <div className="empty-state-icon w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center">
                        <Icon icon="mdi:devices" width={40} />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-heading">No Devices Selected</h3>
                    <p className="text-sm text-muted max-w-xs">
                        Click the device selector in the toolbar to add devices.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col">
            {/* Toolbar Area */}
            <div className="zoom-bar flex items-center justify-end gap-4 px-4 py-2 border-b border-white/[0.05]">
                {/* Touch Toggle */}
                <button
                    onClick={() => dispatch(setIsGlobalTouchEnabled(!isTouchEnabled))}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors ${isTouchEnabled ? 'bg-primary/20 text-primary' : 'hover:bg-white/5 text-muted hover:text-white'
                        }`}
                    title="Toggle Native Touch Cursor"
                >
                    <Icon icon={isTouchEnabled ? 'mdi:gesture-tap' : 'mdi:cursor-default'} width={18} />
                    <span className="text-xs font-medium">Touch</span>
                </button>

                <div className="w-[1px] h-4 bg-white/10 mx-1"></div>

                {/* Zoom Controls */}
                <div className="flex items-center gap-1">
                    <span className="zoom-label text-xs mr-2 text-muted">Zoom:</span>
                    <button
                        onClick={handleZoomOut}
                        className="zoom-btn p-1 rounded"
                        title="Zoom Out"
                    >
                        <Icon icon="ic:round-remove" width={18} />
                    </button>
                    <span className="zoom-value text-sm min-w-[50px] text-center">
                        {Math.round(zoomFactor * 100)}%
                    </span>
                    <button
                        onClick={handleZoomIn}
                        className="zoom-btn p-1 rounded"
                        title="Zoom In"
                    >
                        <Icon icon="ic:round-add" width={18} />
                    </button>
                </div>
            </div>

            {/* Device Strip - Horizontal layout */}
            <div className="flex-1 overflow-auto">
                <div className="flex gap-4 p-4 h-fit min-w-max">
                    {devices.map((device, idx) => (
                        <DevicePreview
                            key={device.id}
                            device={device}
                            isPrimary={idx === 0}
                            index={idx}
                            onNavigate={idx === 0 ? handleNavigate : undefined}
                        />
                    ))}
                </div>
            </div>
        </div >
    )
}
