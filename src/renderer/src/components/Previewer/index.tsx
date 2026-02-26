import { useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { selectActiveDevices, toggleDeviceInSuite } from '../../store/slices/devices'
import {
    selectZoomFactor,
    setZoomFactor,
    setAddress,
    selectIsGlobalTouchEnabled,
    setIsGlobalTouchEnabled
} from '../../store/slices/renderer'
import { DevicePreview } from './Device'
import { Icon } from '@iconify/react'
import { useRef, useEffect, useState } from 'react'

export const Previewer = () => {
    const dispatch = useDispatch()
    const devices = useSelector(selectActiveDevices)
    const zoomFactor = useSelector(selectZoomFactor)
    const isTouchEnabled = useSelector(selectIsGlobalTouchEnabled);

    const [scrollState, setScrollState] = useState({ showLeft: false, showRight: false })
    const scrollRef = useRef<HTMLDivElement>(null)

    const checkScroll = useCallback(() => {
        if (!scrollRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        setScrollState({
            showLeft: scrollLeft > 1,
            showRight: Math.ceil(scrollLeft + clientWidth) < scrollWidth - 1
        });
    }, [])


    const handleNavigate = useCallback((url: string) => {
        dispatch(setAddress(url))
    }, [dispatch])

    useEffect(() => {
        checkScroll()
        window.addEventListener('resize', checkScroll)
        return () => window.removeEventListener('resize', checkScroll)
    }, [checkScroll, devices])

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
            <div className="zoom-bar flex items-center justify-between gap-4 px-4 py-2 border-b border-[var(--border-color)] bg-[var(--bg-secondary)] min-h-[44px]">

                {/* Active Devices Strip (Left side) */}
                <div className="flex-1 relative min-w-0 pr-2 h-full flex items-center">
                    {scrollState.showLeft && (
                        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[var(--bg-secondary)] to-transparent z-10 pointer-events-none" />
                    )}
                    <div
                        ref={scrollRef}
                        onScroll={checkScroll}
                        className="flex items-center gap-2 overflow-x-auto custom-scroll-x min-w-0 pb-0.5 w-full"
                    >
                        <Icon icon="mdi:cellphone-link" className="text-[var(--text-muted)] flex-shrink-0" width={16} />
                        <div className="w-[1px] h-4 bg-[var(--border-color)] mx-1 flex-shrink-0"></div>
                        {devices.map(device => (
                            <div
                                key={device.id}
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[var(--border-color)] bg-[var(--bg-tertiary)] whitespace-nowrap text-xs transition-colors hover:bg-[var(--btn-hover)] flex-shrink-0"
                            >
                                <Icon
                                    icon={device.type === 'phone' ? 'mdi:cellphone' : device.type === 'tablet' ? 'mdi:tablet' : 'mdi:monitor'}
                                    className="text-[var(--text-muted)]"
                                    width={14}
                                />
                                <span className="text-[var(--text-secondary)] font-medium max-w-[120px] truncate">{device.name}</span>
                                <button
                                    onClick={() => dispatch(toggleDeviceInSuite(device.id))}
                                    className="p-0.5 rounded-full hover:bg-[var(--btn-hover)] text-[var(--text-muted)] hover:text-red-500 transition-colors ml-1"
                                    title="Close device"
                                >
                                    <Icon icon="ic:round-close" width={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                    {scrollState.showRight && (
                        <div className="absolute right-2 top-0 bottom-0 w-8 bg-gradient-to-l from-[var(--bg-secondary)] to-transparent z-10 pointer-events-none" />
                    )}
                </div>

                {/* Right Controls Area */}
                <div className="flex items-center gap-3 flex-shrink-0">
                    {/* Touch Toggle */}
                    <button
                        onClick={() => dispatch(setIsGlobalTouchEnabled(!isTouchEnabled))}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors ${isTouchEnabled ? 'bg-[var(--accent)] text-white' : 'hover:bg-[var(--btn-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                            }`}
                        title="Toggle Native Touch Cursor"
                    >
                        <Icon icon={isTouchEnabled ? 'mdi:gesture-tap' : 'mdi:cursor-default'} width={18} />
                        <span className="text-xs font-medium">Touch</span>
                    </button>

                    <div className="w-[1px] h-4 bg-[var(--border-color)] mx-1"></div>


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
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden">
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

            </div>
        </div >
    )
}
