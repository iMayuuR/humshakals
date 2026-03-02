import { useState, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useSelector, useDispatch } from 'react-redux'
import { selectDeviceCaughtEvents, clearDeviceEvents, CaughtEvent } from '../../../store/slices/devtoolsPocket'
import { Device } from '../../../data/deviceList'
import { Icon } from '@iconify/react'
import { getFormattedDate, cleanString } from '../../../utils/helpers'

interface BugPopupProps {
    device: Device
    anchorRef?: React.RefObject<HTMLDivElement>
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

const MIN_W = 200
const MIN_H = 160

export const BugPopup = ({ device, anchorRef, onClose }: BugPopupProps) => {
    const dispatch = useDispatch()
    const caughtEvents = useSelector(selectDeviceCaughtEvents(device.id))
    const [activeTab, setActiveTab] = useState<TabKey>('errors')

    // ── Drag & Resize state ──
    const [size, setSize] = useState<{ w: number, h: number | 'auto' }>({ w: 260, h: 'auto' })

    // Explicit manual resize track flag to lock height once resized
    const [hasBeenResized, setHasBeenResized] = useState(false)

    // Initial centered or anchored position
    const [pos, setPos] = useState(() => {
        if (anchorRef?.current) {
            const rect = anchorRef.current.getBoundingClientRect()
            return {
                // Exact match to old position: top-10 (40px) right-1 (4px) relative to device card
                // Ensure x is at least 10px from the left edge of the window so it doesn't cut off
                x: Math.max(10, Math.min(window.innerWidth - 270, rect.right - 260 - 4)),
                y: Math.max(10, rect.top + 40)
            }
        }
        const offset = Math.floor(Math.random() * 50)
        return {
            x: Math.max(20, window.innerWidth / 2 - 140 + offset),
            y: Math.max(20, window.innerHeight / 2 - 200 + offset)
        }
    })

    const dragRef = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null)
    const resizeRef = useRef<{ startX: number; startY: number; originW: number; originH: number | 'auto' } | null>(null)

    // Ref for the main popup wrapper to do direct DOM manipulations for 60fps
    const containerRef = useRef<HTMLDivElement>(null)

    // ── Drag handlers ──
    const onDragStart = useCallback((e: React.MouseEvent) => {
        if (e.button !== 0) return // Only left click
        e.preventDefault()
        dragRef.current = { startX: e.clientX, startY: e.clientY, originX: pos.x, originY: pos.y }

        const onMove = (ev: MouseEvent) => {
            if (!dragRef.current || !containerRef.current) return
            const dx = ev.clientX - dragRef.current.startX
            const dy = ev.clientY - dragRef.current.startY

            const newX = Math.max(0, dragRef.current.originX + dx)
            const newY = Math.max(0, dragRef.current.originY + dy)

            // Unlink from React state during drag for perfect 60fps smoothness
            containerRef.current.style.left = `${newX}px`
            containerRef.current.style.top = `${newY}px`
        }

        const onUp = (ev: MouseEvent) => {
            if (!dragRef.current) return
            // Sync final position to React state on drop
            const dx = ev.clientX - dragRef.current.startX
            const dy = ev.clientY - dragRef.current.startY
            setPos({
                x: Math.max(0, dragRef.current.originX + dx),
                y: Math.max(0, dragRef.current.originY + dy)
            })
            dragRef.current = null
            window.removeEventListener('mousemove', onMove)
            window.removeEventListener('mouseup', onUp)
        }
        window.addEventListener('mousemove', onMove)
        window.addEventListener('mouseup', onUp)
    }, [pos])

    // ── Resize handlers ──
    const onResizeStart = useCallback((e: React.MouseEvent) => {
        if (e.button !== 0) return
        e.preventDefault()
        e.stopPropagation()
        resizeRef.current = { startX: e.clientX, startY: e.clientY, originW: size.w, originH: size.h }
        setHasBeenResized(true) // instantly mark resized so empty state goes from auto -> px

        // Compute starting height carefully for 'auto'
        let baseH = 380
        if (size.h === 'auto') {
            baseH = containerRef.current?.getBoundingClientRect().height || MIN_H
        } else {
            baseH = size.h as number
        }

        const onMove = (ev: MouseEvent) => {
            if (!resizeRef.current || !containerRef.current) return
            const dw = ev.clientX - resizeRef.current.startX
            const dh = ev.clientY - resizeRef.current.startY

            const newW = Math.max(MIN_W, resizeRef.current.originW + dw)
            const newH = Math.max(MIN_H, baseH + dh)

            // Bypass React render engine during rapid 60Hz resizing
            containerRef.current.style.width = `${newW}px`
            containerRef.current.style.height = `${newH}px`
        }

        const onUp = (ev: MouseEvent) => {
            if (!resizeRef.current) return
            const dw = ev.clientX - resizeRef.current.startX
            const dh = ev.clientY - resizeRef.current.startY

            // Commit final computed size to state
            setSize({
                w: Math.max(MIN_W, resizeRef.current.originW + dw),
                h: Math.max(MIN_H, baseH + dh)
            })

            resizeRef.current = null
            window.removeEventListener('mousemove', onMove)
            window.removeEventListener('mouseup', onUp)
        }
        window.addEventListener('mousemove', onMove)
        window.addEventListener('mouseup', onUp)
    }, [size])

    // Derived states
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

    // ── Position & Dimension Styles ──
    const containerStyle: React.CSSProperties = {
        position: 'fixed',
        left: pos.x,
        top: pos.y,
        width: size.w,
        // If resized, respect manual height. Otherwise, auto if empty, or auto/380 if populated
        height: hasBeenResized ? size.h : (caughtEvents.length === 0 ? 'auto' : (size.h === 'auto' ? 380 : size.h)),
        zIndex: 9999, // Super high z-index to float over everything
        maxWidth: '100vw',
        maxHeight: '100vh',
    }

    // ── Header common  ──
    const header = (
        <div
            onMouseDown={onDragStart}
            className="px-2.5 py-1.5 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-tertiary)] rounded-t-lg select-none"
            style={{ cursor: 'grab' }}
        >
            <h3 className="font-bold text-[10px] flex items-center gap-1 min-w-0">
                <Icon icon="ic:round-terminal" width={13} className="flex-shrink-0" />
                <span className="truncate">
                    Pocket • {device.name}
                    {caughtEvents.length > 0 && ` (${caughtEvents.length})`}
                </span>
            </h3>
            <button
                onClick={onClose}
                onMouseDown={(e) => e.stopPropagation()}
                className="hover:text-red-500 transition-colors flex-shrink-0 ml-1"
            >
                <Icon icon="lucide:x" width={13} />
            </button>
        </div>
    )

    // ── Resize Handle common ──
    const resizeHandle = (
        <div
            onMouseDown={onResizeStart}
            className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize opacity-40 hover:opacity-80 transition-opacity flex items-end justify-end mb-0.5 mr-0.5"
            style={{ touchAction: 'none' }}
        >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" className="text-muted">
                <path d="M14 14H12V12H14V14ZM14 10H12V8H14V10ZM10 14H8V12H10V14Z" />
            </svg>
        </div>
    )

    if (caughtEvents.length === 0) {
        return createPortal(
            <div
                ref={containerRef}
                className="bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-2xl rounded-lg flex flex-col animate-in fade-in slide-in-from-top-2"
                style={containerStyle}
            >
                {header}
                <div className="flex-1 flex items-center justify-center p-4">
                    <p className="text-muted text-[10px]">No events captured yet.</p>
                </div>
                {resizeHandle}
            </div>,
            document.body
        )
    }

    // Use a portal to jump out of the device container's relative boundaries
    return createPortal(
        <div
            ref={containerRef}
            className="bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-2xl rounded-lg flex flex-col animate-in fade-in slide-in-from-top-2"
            style={containerStyle}
        >
            {header}

            {/* Header rendered above Tabs directly */}
            {/* Tabs */}
            <div className="flex border-b border-[var(--border-color)] flex-shrink-0">
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

            {/* Actions */}
            <div className="px-2 py-1.5 border-t border-[var(--border-color)] flex gap-1.5 flex-shrink-0">
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

            {resizeHandle}
        </div>,
        document.body
    )
}
