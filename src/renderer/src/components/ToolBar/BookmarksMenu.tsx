import { useState, useRef, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Icon } from '@iconify/react'
import { selectBookmarks, removeBookmark } from '../../store/slices/bookmarks'
import { setAddress } from '../../store/slices/renderer'

export const BookmarksMenu = () => {
    const dispatch = useDispatch()
    const bookmarks = useSelector(selectBookmarks)
    const [isOpen, setIsOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [isOpen])

    const handleSelect = (url: string) => {
        dispatch(setAddress(url))
        setIsOpen(false)
    }

    const handleDelete = (e: React.MouseEvent, url: string) => {
        e.stopPropagation()
        dispatch(removeBookmark(url))
    }

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-1.5 rounded transition-colors duration-150 flex items-center justify-center text-[var(--text-primary)] hover:bg-black/10 dark:hover:bg-white/10 ${isOpen ? 'bg-black/10 dark:bg-white/10' : ''}`}
                title="Bookmarks"
            >
                <Icon icon="mdi:bookmark-multiple-outline" width={18} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-md shadow-lg z-50 py-1 overflow-hidden">
                    <div className="px-3 py-2 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-tertiary)]">
                        <span className="text-sm font-medium text-[var(--text-primary)]">Bookmarks</span>
                        <span className="text-xs text-[var(--text-muted)] bg-[var(--bg-primary)] px-1.5 py-0.5 rounded border border-[var(--border-color)]">Ctrl+D</span>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                        {bookmarks.length === 0 ? (
                            <div className="px-3 py-4 text-sm text-[var(--text-muted)] text-center">
                                No bookmarks yet.<br/>Press Ctrl+D to bookmark a page.
                            </div>
                        ) : (
                            bookmarks.map((bookmark) => (
                                <div
                                    key={bookmark.url}
                                    onClick={() => handleSelect(bookmark.url)}
                                    className="px-3 py-2 hover:bg-[var(--bg-tertiary)] cursor-pointer flex justify-between items-center group border-b border-[var(--border-color)] last:border-0"
                                >
                                    <div className="overflow-hidden flex-1 mr-2">
                                        <div className="text-sm text-[var(--text-primary)] truncate" title={bookmark.title}>{bookmark.title}</div>
                                        <div className="text-xs text-[var(--text-muted)] truncate" title={bookmark.url}>{bookmark.url}</div>
                                    </div>
                                    <button
                                        onClick={(e) => handleDelete(e, bookmark.url)}
                                        className="p-1 text-[var(--text-muted)] hover:text-red-500 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Remove bookmark"
                                    >
                                        <Icon icon="mdi:close" width={14} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}