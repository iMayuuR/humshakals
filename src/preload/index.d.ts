import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
    interface Window {
        electron: ElectronAPI
        api: {
            enableTouchEmulation: (webContentsId: number, width: number, height: number, isMobile: boolean) => Promise<boolean>
            disableTouchEmulation: (webContentsId: number) => Promise<boolean>
            getAppVersion: () => Promise<string>
            onUpdateStatus: (callback: (status: string) => void) => () => void
            onUpdateProgress: (callback: (percent: number) => void) => () => void
            versions: NodeJS.ProcessVersions
            platform: NodeJS.Platform
        }
    }
}
