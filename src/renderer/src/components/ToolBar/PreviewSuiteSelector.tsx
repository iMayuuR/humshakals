import { useState, useRef, useEffect } from 'react'
import { Icon } from '@iconify/react'
import { useDispatch, useSelector } from 'react-redux'
import {
    selectPreviewSuites,
    selectActiveSuite,
    setActiveSuite,
    toggleDeviceInSuite,
    selectAllDevices
} from '../../store/slices/devices'

export const PreviewSuiteSelector = () => {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const dispatch = useDispatch()

    const suites = useSelector(selectPreviewSuites)
    const activeSuite = useSelector(selectActiveSuite)
    const allDevices = useSelector(selectAllDevices)

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const activeDevices = activeSuite.deviceIds
        .map(id => allDevices.find(d => d.id === id))
        .filter(Boolean)

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="dropdown-trigger flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors"
            >
                <Icon icon="mdi:devices" width={16} />
                <span className="max-w-[120px] truncate">{activeSuite.name}</span>
                <span className="dropdown-count">({activeSuite.deviceIds.length})</span>
                <Icon icon="ic:round-keyboard-arrow-down" width={18} />
            </button>

            {isOpen && (
                <div className="dropdown-menu absolute top-full mt-1 right-0 w-72 rounded-lg shadow-xl z-50 max-h-96 overflow-auto">

                    {/* Suites section */}
                    <div className="p-2 dropdown-section">
                        <span className="dropdown-label text-xs uppercase px-2">Suites</span>
                        {suites.map(suite => (
                            <button
                                key={suite.id}
                                onClick={() => {
                                    dispatch(setActiveSuite(suite.id))
                                    setIsOpen(false)
                                }}
                                className={`w-full flex items-center justify-between px-2 py-1.5 rounded
                                    text-sm text-left transition-colors
                                    ${suite.id === activeSuite.id
                                        ? 'dropdown-item-active'
                                        : 'dropdown-item'}`}
                            >
                                <div className="flex items-center gap-2">
                                    <span>{suite.name}</span>
                                    {suite.id === activeSuite.id && (
                                        <Icon icon="mdi:check" className="text-[var(--text-primary)]" width={14} />
                                    )}
                                </div>
                                <span className="text-xs opacity-60">
                                    {suite.deviceIds.length} devices
                                </span>
                            </button>))}
                    </div>

                    {/* Active devices section */}
                    <div className="p-2 dropdown-section">
                        <span className="dropdown-label text-xs uppercase px-2 mb-2 block">Active Devices</span>
                        <div className="flex flex-col gap-1 px-1">
                            {activeDevices.map(device => device && (
                                <div
                                    key={device.id}
                                    className="flex items-center justify-between px-2 py-1.5 text-sm rounded bg-[var(--bg-tertiary)] border border-[var(--accent)]/30 shadow-sm"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.8)] animate-pulse" />
                                        <Icon
                                            icon={device.type === 'phone' ? 'mdi:cellphone' :
                                                device.type === 'tablet' ? 'mdi:tablet' : 'mdi:monitor'}
                                            width={14}
                                            className="text-[var(--accent)]"
                                        />
                                        <span className="font-medium text-[var(--text-primary)]">{device.name}</span>
                                    </div>
                                    <button
                                        onClick={() => dispatch(toggleDeviceInSuite(device.id))}
                                        className="p-1 rounded text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-500 transition-colors"
                                        title="Close device"
                                    >
                                        <Icon icon="ic:round-close" width={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* All Available Devices - grouped by type */}
                    <div className="p-2 dropdown-section">
                        <span className="dropdown-label text-xs uppercase px-2">Add Devices</span>

                        {/* Phones */}
                        <div className="text-xs text-muted px-2 mt-2 mb-1">📱 Phones</div>
                        {allDevices.filter(d => d.type === 'phone').map(device => (
                            <button
                                key={device.id}
                                onClick={() => dispatch(toggleDeviceInSuite(device.id))}
                                className={`w-full flex items-center justify-between px-2 py-1 text-sm rounded transition-colors
                                    ${activeSuite.deviceIds.includes(device.id) ? 'dropdown-item-active' : 'dropdown-item'}`}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="truncate">{device.name}</span>
                                    {activeSuite.deviceIds.includes(device.id) && (
                                        <Icon icon="mdi:check" className="text-white" width={14} />
                                    )}
                                </div>
                                <span className="text-xs opacity-60">{device.width}×{device.height}</span>
                            </button>
                        ))}

                        {/* Tablets */}
                        <div className="text-xs text-muted px-2 mt-2 mb-1">📱 Tablets</div>
                        {allDevices.filter(d => d.type === 'tablet').map(device => (
                            <button
                                key={device.id}
                                onClick={() => dispatch(toggleDeviceInSuite(device.id))}
                                className={`w-full flex items-center justify-between px-2 py-1 text-sm rounded transition-colors
                                    ${activeSuite.deviceIds.includes(device.id) ? 'dropdown-item-active' : 'dropdown-item'}`}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="truncate">{device.name}</span>
                                    {activeSuite.deviceIds.includes(device.id) && (
                                        <Icon icon="mdi:check" className="text-white" width={14} />
                                    )}
                                </div>
                                <span className="text-xs opacity-60">{device.width}×{device.height}</span>
                            </button>
                        ))}

                        {/* Desktops */}
                        <div className="text-xs text-muted px-2 mt-2 mb-1">🖥️ Desktops</div>
                        {allDevices.filter(d => d.type === 'desktop').map(device => (
                            <button
                                key={device.id}
                                onClick={() => dispatch(toggleDeviceInSuite(device.id))}
                                className={`w-full flex items-center justify-between px-2 py-1 text-sm rounded transition-colors
                                    ${activeSuite.deviceIds.includes(device.id) ? 'dropdown-item-active' : 'dropdown-item'}`}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="truncate">{device.name}</span>
                                    {activeSuite.deviceIds.includes(device.id) && (
                                        <Icon icon="mdi:check" className="text-white" width={14} />
                                    )}
                                </div>
                                <span className="text-xs opacity-60">{device.width}×{device.height}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
