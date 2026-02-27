import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
    interface Window {
        electron: ElectronAPI
        api: {
            saveConfig: (config: any) => Promise<boolean>
            enableDeviceEmulation: (webContentsId: number, parameters: any) => Promise<boolean>
            disableDeviceEmulation: (webContentsId: number) => Promise<boolean>
            enableTouchEmulation: (webContentsId: number, width: number, height: number, isMobile: boolean) => Promise<boolean>
            toggleTouchCursor: (webContentsId: number, enabled: boolean) => Promise<boolean>
            disableTouchEmulation: (webContentsId: number) => Promise<boolean>
            setDeviceMetricsOverride: (webContentsId: number, parameters: any) => Promise<boolean>
            openDevTools: (webContentsId: number, isDocked: boolean) => Promise<boolean>
            saveScreenshot: (filename: string, dataUrl: string) => Promise<string>
            saveBugReport: (filename: string, content: string) => Promise<string>
            installUpdate: () => Promise<void>
            openExternal: (url: string) => Promise<void>
            getUserAgent: () => Promise<string>
            versions: NodeJS.ProcessVersions
            platform: NodeJS.Platform
        }
    }
}
