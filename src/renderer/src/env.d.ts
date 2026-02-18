/// <reference types="vite/client" />

interface Window {
    api: {
        enableTouchEmulation(webContentsId: number, width: number, height: number, isMobile: boolean): Promise<void>
        disableTouchEmulation(webContentsId: number): Promise<void>
        checkForUpdates(): Promise<any>
        versions: NodeJS.ProcessVersions
        platform: NodeJS.Platform
    }
}
