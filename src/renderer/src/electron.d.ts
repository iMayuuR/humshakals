declare namespace Electron {
    interface WebviewTag extends HTMLElement {
        src: string
        partition: string
        useragent: string
        allowpopups: boolean
        webpreferences: string
        reload(): void
        goBack(): void
        goForward(): void
        canGoBack(): boolean
        canGoForward(): boolean
        stop(): void
        loadURL(url: string): Promise<void>
        getURL(): string
        getTitle(): string
        isLoading(): boolean
        openDevTools(): void
        closeDevTools(): void
        isDevToolsOpened(): boolean
        executeJavaScript(code: string): Promise<any>
        capturePage(): Promise<NativeImage>
        addEventListener<K extends keyof WebviewTagEventMap>(
            type: K,
            listener: (event: WebviewTagEventMap[K]) => void
        ): void
        removeEventListener<K extends keyof WebviewTagEventMap>(
            type: K,
            listener: (event: WebviewTagEventMap[K]) => void
        ): void
    }

    interface WebviewTagEventMap {
        'did-start-loading': Event
        'did-stop-loading': Event
        'did-finish-load': Event
        'did-fail-load': DidFailLoadEvent
        'did-navigate': DidNavigateEvent
        'did-navigate-in-page': DidNavigateInPageEvent
        'console-message': ConsoleMessageEvent
        'dom-ready': Event
    }

    interface DidFailLoadEvent extends Event {
        errorCode: number
        errorDescription: string
        validatedURL: string
        isMainFrame: boolean
    }

    interface DidNavigateEvent extends Event {
        url: string
    }

    interface DidNavigateInPageEvent extends Event {
        url: string
        isMainFrame: boolean
    }

    interface ConsoleMessageEvent extends Event {
        level: number
        message: string
        line: number
        sourceId: string
    }

    interface NativeImage {
        toDataURL(): string
        toPNG(): Buffer
        toJPEG(quality: number): Buffer
        isEmpty(): boolean
        getSize(): { width: number; height: number }
    }
}
