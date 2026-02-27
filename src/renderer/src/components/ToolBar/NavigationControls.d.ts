interface NavigationControlsProps {
    onBack: () => void;
    onForward: () => void;
    onReload: () => void;
    canGoBack?: boolean;
    canGoForward?: boolean;
}
export declare const NavigationControls: ({ onBack, onForward, onReload, canGoBack, canGoForward }: NavigationControlsProps) => import("react/jsx-runtime").JSX.Element;
export {};
