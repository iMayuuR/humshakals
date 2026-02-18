import { useState, KeyboardEvent } from 'react'
import { Icon } from '@iconify/react'

interface AddressBarProps {
    address: string
    onNavigate: (url: string) => void
    isLoading?: boolean
}

export const AddressBar = ({ address, onNavigate, isLoading = false }: AddressBarProps) => {
    const [inputValue, setInputValue] = useState(address)

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleNavigate()
        }
    }

    const handleNavigate = () => {
        let url = inputValue.trim()
        if (!url) return

        // Add protocol if missing
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url
        }

        onNavigate(url)
    }

    return (
        <div className="flex-1 flex items-center gap-2 mx-4">
            <div className="flex-1 relative">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter URL..."
                    className="w-full address-bar transition-colors"
                />
                {isLoading && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        <div className="spinner" />
                    </div>
                )}
            </div>
            <button
                onClick={handleNavigate}
                className="go-button flex items-center gap-1"
            >
                <Icon icon="ic:round-arrow-forward" width={16} />
                Go
            </button>
        </div>
    )
}
