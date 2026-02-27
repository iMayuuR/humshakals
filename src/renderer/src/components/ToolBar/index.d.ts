interface ToolBarProps {
    onReloadAll: () => void;
    onGoBack: () => void;
    onGoForward: () => void;
    onScreenshotAll: () => void;
    onToggleTheme?: () => void;
    isDarkMode?: boolean;
}
export declare const ToolBar: ({ onReloadAll, onGoBack, onGoForward, onScreenshotAll, onToggleTheme, isDarkMode }: ToolBarProps) => import("react/jsx-runtime").JSX.Element;
export {};
