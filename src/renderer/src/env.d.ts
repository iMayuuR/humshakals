/// <reference types="vite/client" />

interface Window {
    api: {
        enableTouchEmulation(webContentsId: number, width: number, height: number, isMobile: boolean): Promise<void>
        toggleTouchCursor(webContentsId: number, enabled: boolean): Promise<void>
        disableTouchEmulation(webContentsId: number): Promise<void>
        getAppVersion(): Promise<string>
        onUpdateStatus(callback: (status: string) => void): () => void
        onUpdateProgress(callback: (percent: number) => void): () => void
        versions: NodeJS.ProcessVersions
        platform: NodeJS.Platform
    }
}
