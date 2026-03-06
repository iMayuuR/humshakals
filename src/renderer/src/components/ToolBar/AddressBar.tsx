import { useState, KeyboardEvent, useEffect } from 'react'
import { Icon } from '@iconify/react'
import { useDispatch, useSelector } from 'react-redux'
import { showToast, getCleanDomain } from '../../utils/helpers'
import { toggleBookmark, selectIsBookmarked } from '../../store/slices/bookmarks'

interface AddressBarProps {
    address: string
    onNavigate: (url: string) => void
    onReload: () => void
    isLoading?: boolean
}

export const AddressBar = ({ address, onNavigate, onReload, isLoading = false }: AddressBarProps) => {
    const dispatch = useDispatch()
    const isBookmarked = useSelector(selectIsBookmarked(address))
    const [inputValue, setInputValue] = useState(address)

    useEffect(() => {
        setInputValue(address)
    }, [address])

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            if (e.ctrlKey || e.metaKey) {
                let val = inputValue.trim()
                if (!val.includes('.')) {
                    val = `www.${val}.com`
                    setInputValue(val)
                }
                handleNavigate(val)
            } else {
                handleNavigate()
            }
        }
    }

    const handleNavigate = (forcedUrl?: string) => {
        let url = forcedUrl || inputValue.trim()
        if (!url) return

        const isUrlPattern = /^((https?:\/\/)?[\w.-]+\.[a-z]{2,}(:\d{1,5})?(\/.*)?|localhost(:\d{1,5})?(\/.*)?|about:blank)$/i.test(url)

        if (!isUrlPattern && !url.includes('://')) {
            url = `https://www.google.com/search?q=${encodeURIComponent(url)}`
            setInputValue(url)
        } else {
            if (!url.startsWith('http://') && !url.startsWith('https://') && url !== 'about:blank') {
                url = 'https://' + url
                setInputValue(url)
            }
        }

        if (url === address) {
            onReload()
        } else {
            onNavigate(url)
        }
    }

    const handleClearData = async (type: 'cookies' | 'storage' | 'cache') => {
        if (window.api && window.api.clearDeviceData) {
            const success = await window.api.clearDeviceData(type)
            if (success) {
                showToast(`Cleared ${type} successfully!`, 'success')
                onReload()
            } else {
                showToast(`Failed to clear ${type}`, 'error')
            }
        }
    }

    const handleToggleBookmark = () => {
        if (!address || address === 'about:blank') return
        const title = getCleanDomain(address) || address
        dispatch(toggleBookmark({ url: address, title }))
        showToast(isBookmarked ? 'Removed from bookmarks' : 'Bookmark added!', 'success')
    }

    return (
        <div className="flex-1 flex items-center gap-2 mx-4">
            <div className="flex-1 relative group flex items-center">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                    onBlur={() => setInputValue(address)}
                    placeholder="Enter URL or search..."
                    className="w-full address-bar transition-colors pr-[120px]"
                />
                <div className="absolute right-1.5 flex items-center gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                    <button 
                        onClick={handleToggleBookmark} 
                        className={`p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded text-xs flex items-center justify-center transition-colors ${isBookmarked ? 'text-primary-500' : 'text-[var(--text-primary)]'}`} 
                        title={isBookmarked ? "Remove Bookmark (Ctrl+D)" : "Bookmark this page (Ctrl+D)"}
                    >
                        <Icon icon={isBookmarked ? "mdi:star" : "mdi:star-outline"} width={16} />
                    </button>
                    <div className="w-px h-3 bg-[var(--border-color)] mx-0.5"></div>
                    <button onClick={() => handleClearData('cookies')} className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded text-xs flex items-center justify-center text-[var(--text-primary)] transition-colors" title="Clear Cookies">
                        <Icon icon="mdi:cookie-outline" width={14} />
                    </button>
                    <button onClick={() => handleClearData('storage')} className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded text-xs flex items-center justify-center text-[var(--text-primary)] transition-colors" title="Clear Storage (Local, IndexedDB, etc.)">
                        <Icon icon="mdi:database-outline" width={14} />
                    </button>
                    <button onClick={() => handleClearData('cache')} className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded text-xs flex items-center justify-center text-[var(--text-primary)] transition-colors" title="Clear Cache">
                        <Icon icon="mdi:cached" width={14} />
                    </button>
                </div>
                {isLoading && (
                    <div className="absolute right-[110px] top-1/2 -translate-y-1/2">
                        <div className="spinner" />
                    </div>
                )}
            </div>
            <button
                onClick={() => handleNavigate()}
                className="go-button flex items-center gap-1"
            >
                <Icon icon="ic:round-arrow-forward" width={16} />
                Go
            </button>
        </div>
    )
}
