interface DeviceToolbarProps {
    onRefresh: () => void;
    onQuickScreenshot: () => void;
    onToggleMirroring: () => void;
    onOpenDevtools: () => void;
    onRotate: () => void;
    onScrollToTop: () => void;
    isMirroringOff: boolean;
    canRotate: boolean;
    isRotated: boolean;
    isScreenshotLoading: boolean;
    isDevToolsOpen?: boolean;
}
export declare const DeviceToolbar: ({ onRefresh, onQuickScreenshot, onToggleMirroring, onOpenDevtools, onRotate, onScrollToTop, isMirroringOff, canRotate, isRotated, isScreenshotLoading, isDevToolsOpen }: DeviceToolbarProps) => import("react/jsx-runtime").JSX.Element;
export {};
