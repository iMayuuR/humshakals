// Type declarations for main process

// electron-updater types
declare module 'electron-updater' {
    import { EventEmitter } from 'events'

    export interface UpdateInfo {
        version: string
        files: Array<{ url: string; size: number }>
        releaseDate: string
        releaseName?: string
        releaseNotes?: string
    }

    export interface ProgressInfo {
        total: number
        delta: number
        transferred: number
        percent: number
        bytesPerSecond: number
    }

    export interface UpdateCheckResult {
        updateInfo: UpdateInfo
        downloadPromise?: Promise<string[]>
    }

    class AppUpdater extends EventEmitter {
        autoDownload: boolean
        autoInstallOnAppQuit: boolean
        checkForUpdates(): Promise<UpdateCheckResult | null>
        downloadUpdate(): Promise<string[]>
        quitAndInstall(): void
        on(event: 'update-available', listener: (info: UpdateInfo) => void): this
        on(event: 'update-not-available', listener: (info: UpdateInfo) => void): this
        on(event: 'download-progress', listener: (progress: ProgressInfo) => void): this
        on(event: 'update-downloaded', listener: (info: UpdateInfo) => void): this
        on(event: 'error', listener: (error: Error) => void): this
    }

    export const autoUpdater: AppUpdater
}
