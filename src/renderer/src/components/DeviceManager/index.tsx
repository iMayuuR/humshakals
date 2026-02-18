import { useState, useRef, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Icon } from '@iconify/react'
import { selectAllDevices, toggleDeviceInSuite, selectActiveSuite } from '../../store/slices/devices'
import { selectShowDeviceManager, setShowDeviceManager } from '../../store/slices/ui'

export const DeviceManager = () => {
    const dispatch = useDispatch()
    const isOpen = useSelector(selectShowDeviceManager)
    const allDevices = useSelector(selectAllDevices)
    const activeSuite = useSelector(selectActiveSuite)
    const [filter, setFilter] = useState<'all' | 'phone' | 'tablet' | 'desktop'>('all')

    const modalRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                dispatch(setShowDeviceManager(false))
            }
        }
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown)
        }
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, dispatch])

    if (!isOpen) return null

    const filteredDevices = filter === 'all'
        ? allDevices
        : allDevices.filter(d => d.type === filter)

    const phoneCount = allDevices.filter(d => d.type === 'phone').length
    const tabletCount = allDevices.filter(d => d.type === 'tablet').length
    const desktopCount = allDevices.filter(d => d.type === 'desktop').length

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div
                ref={modalRef}
                className="bg-gray-800 rounded-lg shadow-2xl w-[600px] max-h-[80vh] flex flex-col"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
                    <h2 className="text-lg font-semibold text-white">Manage Devices</h2>
                    <button
                        onClick={() => dispatch(setShowDeviceManager(false))}
                        className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white"
                    >
                        <Icon icon="ic:round-close" width={20} />
                    </button>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 px-6 py-3 border-b border-gray-700">
                    {[
                        { key: 'all', label: 'All', count: allDevices.length },
                        { key: 'phone', label: 'Phones', count: phoneCount, icon: 'mdi:cellphone' },
                        { key: 'tablet', label: 'Tablets', count: tabletCount, icon: 'mdi:tablet' },
                        { key: 'desktop', label: 'Desktops', count: desktopCount, icon: 'mdi:monitor' }
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setFilter(tab.key as typeof filter)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition-colors
                ${filter === tab.key
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                        >
                            {tab.icon && <Icon icon={tab.icon} width={14} />}
                            {tab.label}
                            <span className="text-xs opacity-70">({tab.count})</span>
                        </button>
                    ))}
                </div>

                {/* Device List */}
                <div className="flex-1 overflow-auto p-4">
                    <div className="grid grid-cols-2 gap-2">
                        {filteredDevices.map(device => {
                            const isActive = activeSuite.deviceIds.includes(device.id)
                            return (
                                <button
                                    key={device.id}
                                    onClick={() => dispatch(toggleDeviceInSuite(device.id))}
                                    className={`flex items-center gap-3 p-3 rounded-lg text-left transition-colors
                    ${isActive
                                            ? 'bg-primary-600/20 border-2 border-primary-500'
                                            : 'bg-gray-700 border-2 border-transparent hover:border-gray-500'}`}
                                >
                                    <Icon
                                        icon={device.type === 'phone' ? 'mdi:cellphone' :
                                            device.type === 'tablet' ? 'mdi:tablet' : 'mdi:monitor'}
                                        width={20}
                                        className={isActive ? 'text-primary-400' : 'text-gray-400'}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-gray-200 truncate">
                                            {device.name}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {device.width} × {device.height}
                                        </div>
                                    </div>
                                    {isActive && (
                                        <Icon icon="ic:round-check-circle" width={20} className="text-primary-400" />
                                    )}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-700">
                    <span className="text-sm text-gray-400">
                        {activeSuite.deviceIds.length} devices selected
                    </span>
                    <button
                        onClick={() => dispatch(setShowDeviceManager(false))}
                        className="px-4 py-2 bg-primary-600 hover:bg-primary-500 
              text-white text-sm font-medium rounded transition-colors"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    )
}
