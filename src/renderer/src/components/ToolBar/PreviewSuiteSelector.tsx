import { useState, useRef, useEffect } from 'react'
import { Icon } from '@iconify/react'
import { useDispatch, useSelector } from 'react-redux'
import {
    selectPreviewSuites,
    selectActiveSuite,
    setActiveSuite,
    toggleDeviceInSuite,
    selectAllDevices,
    addCustomDevice,
    removeCustomDevice
} from '../../store/slices/devices'
import { Device } from '../../data/deviceList'

export const PreviewSuiteSelector = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [showCustomForm, setShowCustomForm] = useState(false)
    const [customName, setCustomName] = useState('')
    const [customW, setCustomW] = useState('')
    const [customH, setCustomH] = useState('')
    const [customScale, setCustomScale] = useState('')

    const dropdownRef = useRef<HTMLDivElement>(null)
    const dispatch = useDispatch()

    const suites = useSelector(selectPreviewSuites)
    const activeSuite = useSelector(selectActiveSuite)
    const allDevices = useSelector(selectAllDevices)

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false)
                setShowCustomForm(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const activeDevices = activeSuite.deviceIds
        .map(id => allDevices.find(d => d.id === id))
        .filter(Boolean)

    const handleAddCustomDevice = () => {
        if (!customName || !customW || !customH) return

        const newDevice: Device = {
            id: `custom_${Date.now()}`,
            name: customName,
            width: parseInt(customW) || 375,
            height: parseInt(customH) || 667,
            customScale: customScale ? parseInt(customScale) : undefined,
            dpr: 2,
            userAgent: 'Mozilla/5.0 (Linux; Android 10; Custom Device) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Mobile Safari/537.36',
            type: 'phone',
            isTouchCapable: true,
            isMobileCapable: true
        }

        dispatch(addCustomDevice(newDevice))
        setCustomName('')
        setCustomW('')
        setCustomH('')
        setCustomScale('')
        setShowCustomForm(false)
    }

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
                        {allDevices.filter(d => d.type === 'desktop' && !d.id.startsWith('custom_')).map(device => (
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

                        {/* Custom Devices */}
                        <div className="text-xs text-muted px-2 mt-4 mb-1 flex justify-between items-center border-t border-[var(--border-color)] pt-3">
                            <span>🛠️ Custom Devices</span>
                            <button
                                onClick={() => setShowCustomForm(!showCustomForm)}
                                className="text-[var(--accent)] hover:underline flex items-center gap-1"
                            >
                                <Icon icon="mdi:plus" /> Add New
                            </button>
                        </div>

                        {showCustomForm && (
                            <div className="mx-2 my-2 p-3 bg-[var(--bg-tertiary)] rounded border border-[var(--border-color)] shadow-inner">
                                <input
                                    placeholder="Device Name"
                                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded px-2 py-1 text-sm text-[var(--text-primary)] mb-2 focus:outline-none focus:border-[var(--accent)]"
                                    value={customName}
                                    onChange={(e) => setCustomName(e.target.value)}
                                    autoFocus
                                />
                                <div className="flex gap-2 mb-3">
                                    <input
                                        placeholder="W (px)"
                                        type="text"
                                        className="w-1/3 min-w-0 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded px-2 py-1 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                                        value={customW}
                                        onChange={(e) => setCustomW(e.target.value.replace(/[^0-9]/g, ''))}
                                    />
                                    <input
                                        placeholder="H (px)"
                                        type="text"
                                        className="w-1/3 min-w-0 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded px-2 py-1 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                                        value={customH}
                                        onChange={(e) => setCustomH(e.target.value.replace(/[^0-9]/g, ''))}
                                    />
                                    <input
                                        placeholder="Scale"
                                        type="text"
                                        className="w-1/3 min-w-0 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded px-2 py-1 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                                        value={customScale}
                                        onChange={(e) => setCustomScale(e.target.value.replace(/[^0-9]/g, ''))}
                                        title="Optional: Leave blank for auto scaling"
                                    />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => setShowCustomForm(false)}
                                        className="px-3 py-1 text-sm rounded text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAddCustomDevice}
                                        disabled={!customName || !customW || !customH}
                                        className="px-3 py-1 text-sm rounded bg-[var(--accent)] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--accent-hover)] transition-colors"
                                    >
                                        Create
                                    </button>
                                </div>
                            </div>
                        )}

                        {allDevices.filter(d => d.id.startsWith('custom_')).map(device => (
                            <div key={device.id} className={`w-full flex items-center justify-between px-2 py-1 text-sm rounded transition-colors group ${activeSuite.deviceIds.includes(device.id) ? 'dropdown-item-active' : 'dropdown-item'}`}>
                                <button
                                    onClick={() => dispatch(toggleDeviceInSuite(device.id))}
                                    className="flex-1 flex items-center justify-between text-left"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="truncate">{device.name}</span>
                                        {activeSuite.deviceIds.includes(device.id) && (
                                            <Icon icon="mdi:check" className="text-white" width={14} />
                                        )}
                                    </div>
                                    <span className="text-xs opacity-60 mr-2">{device.width}×{device.height}{device.customScale ? ` (${device.customScale}%)` : ''}</span>
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        dispatch(removeCustomDevice(device.id));
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded transition-all"
                                    title="Delete custom device"
                                >
                                    <Icon icon="mdi:trash-can-outline" width={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
