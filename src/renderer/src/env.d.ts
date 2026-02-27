/// <reference types="vite/client" />

interface Window {
    api: {
        enableTouchEmulation(webContentsId: number, width: number, height: number, isMobile: boolean): Promise<void>
        toggleTouchCursor(webContentsId: number, enabled: boolean): Promise<void>
        disableTouchEmulation(webContentsId: number): Promise<void>
        openDevTools(webContentsId: number, isDocked: boolean): Promise<boolean>
        saveScreenshot(filename: string, dataUrl: string): Promise<string>
        saveBugReport(filename: string, content: string): Promise<string>
        storeGet(key: string): Promise<any>
        storeSet(key: string, data: any): Promise<void>
        getAppVersion(): Promise<string>
        onUpdateStatus(callback: (status: string) => void): () => void
        onUpdateProgress(callback: (percent: number) => void): () => void
        onNetworkRequest(callback: (details: any) => void): () => void
        versions: NodeJS.ProcessVersions
        platform: NodeJS.Platform
    }
}
