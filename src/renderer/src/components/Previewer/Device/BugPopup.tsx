import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { selectDeviceCaughtEvents, clearDeviceEvents, CaughtEvent } from '../../../store/slices/devtoolsPocket'
import { Device } from '../../../data/deviceList'
import { Icon } from '@iconify/react'
import { getFormattedDate, cleanString } from '../../../utils/helpers'

interface BugPopupProps {
    device: Device
    onClose: () => void
}

type TabKey = 'errors' | 'logs' | 'network'

const TABS: { key: TabKey; label: string; icon: string; color: string }[] = [
    { key: 'errors', label: 'Err', icon: 'ic:round-error-outline', color: 'text-red-400' },
    { key: 'logs', label: 'Logs', icon: 'ic:round-article', color: 'text-yellow-400' },
    { key: 'network', label: 'Net', icon: 'ic:round-wifi', color: 'text-blue-400' },
]

const filterByTab = (events: CaughtEvent[], tab: TabKey) => {
    if (tab === 'errors') return events.filter(e => e.type === 'console-error')
    if (tab === 'logs') return events.filter(e => e.type === 'console-log')
    return events.filter(e => e.type === 'network')
}

export const BugPopup = ({ device, onClose }: BugPopupProps) => {
    const dispatch = useDispatch()
    const caughtEvents = useSelector(selectDeviceCaughtEvents(device.id))
    const [activeTab, setActiveTab] = useState<TabKey>('errors')

    const errorCount = caughtEvents.filter(e => e.type === 'console-error').length
    const logCount = caughtEvents.filter(e => e.type === 'console-log').length
    const networkCount = caughtEvents.filter(e => e.type === 'network').length

    const tabCounts: Record<TabKey, number> = { errors: errorCount, logs: logCount, network: networkCount }
    const filteredEvents = filterByTab(caughtEvents, activeTab)

    const handleDownloadReport = async () => {
        if (caughtEvents.length === 0) return

        let content = `DevTools Pocket Report\n`
        content += `Device: ${device.name}\n`
        content += `Timestamp: ${new Date().toLocaleString()}\n`
        content += `${'='.repeat(50)}\n\n`

        const errors = caughtEvents.filter(e => e.type === 'console-error')
        const logs = caughtEvents.filter(e => e.type === 'console-log')
        const network = caughtEvents.filter(e => e.type === 'network')

        if (errors.length > 0) {
            content += `--- CONSOLE ERRORS (${errors.length}) ---\n\n`
            errors.forEach((ev, idx) => {
                const time = new Date(ev.timestamp).toLocaleTimeString()
                content += `[${idx + 1}] ${time}\n`
                content += `Location: ${ev.source || 'unknown'} (Line ${ev.line || '?'})\n`
                content += `Message: ${ev.message}\n\n`
            })
        }

        if (logs.length > 0) {
            content += `--- CONSOLE LOGS (${logs.length}) ---\n\n`
            logs.forEach((ev, idx) => {
                const time = new Date(ev.timestamp).toLocaleTimeString()
                content += `[${idx + 1}] ${time}\n`
                content += `Location: ${ev.source || 'unknown'} (Line ${ev.line || '?'})\n`
                content += `Message: ${ev.message}\n\n`
            })
        }

        if (network.length > 0) {
            content += `--- NETWORK REQUESTS (${network.length}) ---\n\n`
            network.forEach((ev, idx) => {
                const time = new Date(ev.timestamp).toLocaleTimeString()
                content += `[${idx + 1}] ${time}\n`
                content += `URL: ${ev.url}\n`
                content += `Details: ${ev.message}\n\n`
            })
        }

        const dateStr = getFormattedDate()
        const filename = `${cleanString(device.name)}-Report-${dateStr}.txt`

        try {
            await window.api.saveBugReport(filename, content)
            window.dispatchEvent(new CustomEvent('app-toast', {
                detail: { message: `Report saved!`, type: 'success' }
            }))
        } catch (e) {
            console.error('Failed to save report', e)
        }
    }

    const handleClear = () => {
        dispatch(clearDeviceEvents(device.id))
        onClose()
    }

    if (caughtEvents.length === 0) {
        return (
            <div className="absolute top-10 right-1 w-[260px] max-w-[calc(100%-8px)] bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-2xl rounded-lg z-50 p-3 animate-in fade-in slide-in-from-top-2">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-xs flex items-center gap-1">
                        <Icon icon="ic:round-terminal" width={14} />
                        DevTools Pocket
                    </h3>
                    <button onClick={onClose}><Icon icon="lucide:x" width={14} /></button>
                </div>
                <p className="text-muted text-[10px] text-center py-3">No events captured yet.</p>
            </div>
        )
    }

    return (
        <div className="absolute top-10 right-1 w-[260px] max-w-[calc(100%-8px)] bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-2xl rounded-lg z-50 flex flex-col max-h-[380px] animate-in fade-in slide-in-from-top-2">

            {/* Header */}
            <div className="px-2.5 py-2 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-tertiary)] rounded-t-lg">
                <h3 className="font-bold text-xs flex items-center gap-1">
                    <Icon icon="ic:round-terminal" width={14} />
                    <span className="truncate">Pocket ({caughtEvents.length})</span>
                </h3>
                <button onClick={onClose} className="hover:text-red-500 transition-colors flex-shrink-0">
                    <Icon icon="lucide:x" width={14} />
                </button>
            </div>

            {/* Tabs — compact, icon + short label + count */}
            <div className="flex border-b border-[var(--border-color)]">
                {TABS.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex-1 flex items-center justify-center gap-0.5 py-1.5 text-[10px] font-semibold transition-colors border-b-2 ${activeTab === tab.key
                            ? `${tab.color} border-current`
                            : 'text-muted border-transparent hover:text-[var(--text-primary)]'
                            }`}
                    >
                        <Icon icon={tab.icon} width={12} />
                        {tab.label}
                        {tabCounts[tab.key] > 0 && (
                            <span className={`ml-0.5 px-1 rounded text-[8px] ${activeTab === tab.key ? 'bg-white/10' : 'bg-white/5'
                                }`}>
                                {tabCounts[tab.key]}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Event List */}
            <div className="overflow-y-auto flex-1 p-1.5 space-y-1 custom-scrollbar">
                {filteredEvents.length === 0 ? (
                    <p className="text-muted text-[10px] text-center py-4">No {activeTab} captured.</p>
                ) : (
                    [...filteredEvents].reverse().map(ev => (
                        <div key={ev.id} className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded p-1.5 text-[10px]">
                            <div className="text-muted/70 text-[9px] mb-0.5">
                                {new Date(ev.timestamp).toLocaleTimeString()}
                            </div>
                            <div className="break-all font-mono text-[10px] leading-snug opacity-90">
                                {ev.message}
                                {ev.url && <div className="mt-0.5 text-blue-400 break-all text-[9px]">{ev.url}</div>}
                                {ev.source && <div className="mt-0.5 text-muted text-[9px] truncate">{ev.source}:{ev.line}</div>}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Actions — compact */}
            <div className="px-2 py-1.5 border-t border-[var(--border-color)] flex gap-1.5">
                <button
                    onClick={handleClear}
                    className="flex-1 py-1 border border-[var(--border-color)] hover:bg-[var(--bg-tertiary)] rounded text-[10px] font-medium transition-colors"
                >
                    Clear All
                </button>
                <button
                    onClick={handleDownloadReport}
                    className="btn-cta flex-1 py-1 bg-blue-600 hover:bg-blue-500 rounded text-[10px] font-medium transition-colors flex items-center justify-center gap-1"
                >
                    <Icon icon="lucide:download" width={12} />
                    Download
                </button>
            </div>
        </div>
    )
}
