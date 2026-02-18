import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
    interface Window {
        electron: ElectronAPI
        api: {
            enableTouchEmulation: (webContentsId: number, width: number, height: number, isMobile: boolean) => Promise<boolean>
            disableTouchEmulation: (webContentsId: number) => Promise<boolean>
            checkForUpdates: () => Promise<any>
            getAppVersion: () => Promise<string>
            versions: NodeJS.ProcessVersions
            platform: NodeJS.Platform
        }
    }
}
