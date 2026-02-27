interface ButtonProps {
    onClick?: () => void;
    isActive?: boolean;
    isLoading?: boolean;
    disabled?: boolean;
    title?: string;
    children: React.ReactNode;
    className?: string;
}
export declare const Button: ({ onClick, isActive, isLoading, disabled, title, children, className }: ButtonProps) => import("react/jsx-runtime").JSX.Element;
export declare const Spinner: ({ className }: {
    className?: string;
}) => import("react/jsx-runtime").JSX.Element;
export declare const Divider: () => import("react/jsx-runtime").JSX.Element;
export {};
