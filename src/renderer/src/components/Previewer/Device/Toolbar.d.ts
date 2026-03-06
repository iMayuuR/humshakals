interface DeviceToolbarProps {
    onRefresh: () => void;
    onQuickScreenshot: () => void;
    onOpenDevtools: () => void;
    onRotate: () => void;
    onScrollToTop: () => void;
    canRotate: boolean;
    isRotated: boolean;
    isScreenshotLoading: boolean;
    isDevToolsOpen?: boolean;
    caughtBugCount: number;
    onOpenBugPopup: () => void;
}
export declare const DeviceToolbar: ({ onRefresh, onQuickScreenshot, onOpenDevtools, onRotate, onScrollToTop, canRotate, isRotated, isScreenshotLoading, isDevToolsOpen }: DeviceToolbarProps) => import("react/jsx-runtime").JSX.Element;
export { };
