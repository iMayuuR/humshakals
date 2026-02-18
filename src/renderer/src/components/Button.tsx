import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

interface ButtonProps {
    onClick?: () => void
    isActive?: boolean
    isLoading?: boolean
    disabled?: boolean
    title?: string
    children: React.ReactNode
    className?: string
}

export const Button = ({
    onClick,
    isActive = false,
    isLoading = false,
    disabled = false,
    title,
    children,
    className
}: ButtonProps) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled || isLoading}
            title={title}
            className={twMerge(
                clsx(
                    'p-1.5 rounded transition-colors duration-150',
                    'hover:bg-gray-700 active:bg-gray-600',
                    'text-gray-300 hover:text-white',
                    'flex items-center justify-center',
                    'text-base',
                    isActive && 'bg-primary-600 text-white hover:bg-primary-500',
                    (disabled || isLoading) && 'opacity-50 cursor-not-allowed'
                ),
                className
            )}
        >
            {isLoading ? <Spinner /> : children}
        </button>
    )
}

export const Spinner = ({ className }: { className?: string }) => (
    <div
        className={twMerge(
            'w-4 h-4 border-2 border-gray-400 border-t-primary-500 rounded-full animate-spin',
            className
        )}
    />
)

export const Divider = () => (
    <div className="h-6 w-px bg-gray-700 mx-1" />
)
