import { useRef, useState, useEffect, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Device } from '../../../data/deviceList'
import { selectRotateDevices, selectZoomFactor, selectAddress, selectIsGlobalTouchEnabled } from '../../../store/slices/renderer'
import { selectDevToolsRules, addCaughtEvent, selectDeviceCaughtEvents } from '../../../store/slices/devtoolsPocket'
import { DeviceToolbar } from './Toolbar'
import { BugPopup } from './BugPopup'
import { Spinner } from '../../Button'
import { Icon } from '@iconify/react'
import { getFormattedDate, getCleanDomain, cleanString, showToast } from '../../../utils/helpers'

// Access preload API

interface DevicePreviewProps {
    device: Device
    isPrimary: boolean
    index: number
    onNavigate?: (url: string) => void
}

export const DevicePreview = ({
    device,
    isPrimary,
    index,
    onNavigate
}: DevicePreviewProps) => {
    const dispatch = useDispatch()
    const webviewRef = useRef<Electron.WebviewTag>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [hasError, setHasError] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')
    const [singleRotated, setSingleRotated] = useState(false)
    const [isMirroringOff, setIsMirroringOff] = useState(false)
    const [isScreenshotLoading, setIsScreenshotLoading] = useState(false)
    const [hasInitialReload, setHasInitialReload] = useState(false)
    const [isDevToolsOpen, setIsDevToolsOpen] = useState(false)
    const [isBugPopupOpen, setIsBugPopupOpen] = useState(false)

    const address = useSelector(selectAddress)
    const globalRotate = useSelector(selectRotateDevices)
    const globalZoomFactor = useSelector(selectZoomFactor)
    const devToolsRules = useSelector(selectDevToolsRules)
    const caughtEvents = useSelector(selectDeviceCaughtEvents(device.id))
    const caughtBugCount = caughtEvents.length

    // Keep rules in a ref so event listeners always see the latest value
    const rulesRef = useRef(devToolsRules)
    useEffect(() => { rulesRef.current = devToolsRules }, [devToolsRules])

    const zoomFactor = globalZoomFactor

    // Check if device is mobile (phone or tablet)
    const isMobileDevice = device.type === 'phone' || device.type === 'tablet'

    // Determine if device is rotated
    const isRotated = device.isMobileCapable && (globalRotate || singleRotated)

    // Calculate dimensions
    // Custom devices mimic OS-level scaling (e.g. 125% means the CSS viewport is divided by 1.25)
    const scaleDivisor = device.customScale ? (device.customScale / 100) : 1;
    let width = Math.round(device.width / scaleDivisor)
    let height = Math.round(device.height / scaleDivisor)

    if (isRotated) {
        const temp = width
        width = height
        height = temp
    }

    // Scaled dimensions for display
    const scaledWidth = width * zoomFactor
    const scaledHeight = height * zoomFactor

    // Load URL when address changes OR when webview is ready with existing address
    useEffect(() => {
        const webview = webviewRef.current
        if (!webview) return

        // Staggered Loading: Delay based on index (Traffic Shaping)
        // Increased to 1.5s per device to avoid "Rapid Request" bot detection
        const delay = index * 1500

        const loadContent = () => {
            // If address exists, set it immediately
            if (address && webview.src !== address) {
                webview.src = address
            }
        }

        let timeoutId: NodeJS.Timeout
        if (address) {
            timeoutId = setTimeout(loadContent, delay)
        }

        // Also handle case when webview mounts with address already set
        const handleDomReady = (): void => {
            if (address && webview.getURL() !== address && webview.getURL() === 'about:blank') {
                webview.loadURL(address)
            }

            // Auto reload once on first load (Desktop only)
            if (address && !hasInitialReload && address !== 'about:blank' && device.type === 'desktop') {
                console.log(`[AutoReload] Triggering one - time reload for ${device.name}`)
                setHasInitialReload(true)
                // Small delay to ensure current load handles processing
                setTimeout(() => {
                    webview.reload()
                }, 500)
            }

            // Device-Aware Stealth Mode Injection
            const stealthScript = `
    (function () {
        // SILENT MODE: No console logs to avoid detection

        // 1. Remove navigator.webdriver (Common)
        try {
            const proto = Object.getPrototypeOf(navigator);
            if (proto && proto.webdriver) {
                delete proto.webdriver;
            } else {
                delete navigator.webdriver;
            }
        } catch (e) { }

        const userAgent = navigator.userAgent;
        const isIOS = /iPhone|iPad|iPod/.test(userAgent);
        const isAndroid = /Android/.test(userAgent);
        const isMobile = isIOS || isAndroid;

        // 2. Platform & Vendor Mocks
        if (isIOS) {
            Object.defineProperty(navigator, 'platform', { get: () => 'iPhone' });
            Object.defineProperty(navigator, 'vendor', { get: () => 'Apple Computer, Inc.' });
            Object.defineProperty(navigator, 'maxTouchPoints', { get: () => 5 });

            // iOS Safari does NOT have window.chrome
            if ('chrome' in window) {
                delete window.chrome;
            }

            // WebGL Fingerprint Spoofing (Apple GPU)
            const getParameter = WebGLRenderingContext.prototype.getParameter;
            WebGLRenderingContext.prototype.getParameter = function (parameter) {
                // UNMASKED_VENDOR_WEBGL
                if (parameter === 37445) return 'Apple Inc.';
                // UNMASKED_RENDERER_WEBGL
                if (parameter === 37446) return 'Apple GPU';
                return getParameter.apply(this, arguments);
            };
        }
        else if (isAndroid) {
            Object.defineProperty(navigator, 'platform', { get: () => 'Linux armv81' });
            Object.defineProperty(navigator, 'vendor', { get: () => 'Google Inc.' });
            Object.defineProperty(navigator, 'maxTouchPoints', { get: () => 5 });

            // Android Chrome HAS window.chrome
            if (!window.chrome) {
                window.chrome = { runtime: {} };
            }

            // WebGL Fingerprint Spoofing (Adreno)
            const getParameter = WebGLRenderingContext.prototype.getParameter;
            WebGLRenderingContext.prototype.getParameter = function (parameter) {
                if (parameter === 37445) return 'Qualcomm';
                if (parameter === 37446) return 'Adreno (TM) 640';
                return getParameter.apply(this, arguments);
            };
        }
        else {
            // Desktop Handling (Windows vs Mac)
            if (userAgent.includes('Mac')) {
                // Mac Mode (Safari/Chrome on Mac)
                Object.defineProperty(navigator, 'platform', { get: () => 'MacIntel' });
                Object.defineProperty(navigator, 'vendor', { get: () => 'Apple Computer, Inc.' });

                // Safari does not have window.chrome, but Chrome on Mac does.
                // However, our Mac User-Agents are mostly Safari.
                // If we use Chrome UA on Mac, we should keep window.chrome (but typically we use Safari strings for Mac)
                if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
                    if ('chrome' in window) {
                        delete window.chrome;
                    }
                }

                // WebGL Fingerprint Spoofing (Apple M2)
                const getParameter = WebGLRenderingContext.prototype.getParameter;
                WebGLRenderingContext.prototype.getParameter = function (parameter) {
                    // UNMASKED_VENDOR_WEBGL
                    if (parameter === 37445) return 'Apple';
                    // UNMASKED_RENDERER_WEBGL
                    if (parameter === 37446) return 'Apple M2';
                    return getParameter.apply(this, arguments);
                };

                // Hardware Concurrency (M1/M2 usually 8 cores)
                Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 });
                Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });

            } else {
                // Windows Mode (Default)
                Object.defineProperty(navigator, 'platform', { get: () => 'Win32' });
                Object.defineProperty(navigator, 'vendor', { get: () => 'Google Inc.' });

                if (!window.chrome) {
                    window.chrome = {
                        runtime: {},
                        app: {
                            isInstalled: false,
                            InstallState: { DISABLED: 'disabled', INSTALLED: 'installed', NOT_INSTALLED: 'not_installed' },
                            RunningState: { CANNOT_RUN: 'cannot_run', READY_TO_RUN: 'ready_to_run', RUNNING: 'running' }
                        }
                    };
                }
            }

            // Mock Plugins for Desktop (Common)
            if (navigator.plugins.length === 0) {
                Object.defineProperty(navigator, 'plugins', {
                    get: () => [1, 2, 3, 4, 5]
                });
            }
        }

        // 3. Advanced Touch Mocking (Mobile Only)
        if (isMobile) {
            if (!('ontouchstart' in window)) {
                Object.defineProperty(window, 'ontouchstart', { value: null, writable: true });
            }
            // Inject Touch Constructors if missing (Crucial for modern detection)
            if (typeof window.Touch === 'undefined') {
                window.Touch = function Touch() { };
                window.TouchEvent = function TouchEvent() { };
                window.TouchList = function TouchList() { };
            }
        }

        // 3b. Mock Languages (Common)
        if (!navigator.languages || navigator.languages.length === 0) {
            Object.defineProperty(navigator, 'languages', {
                get: () => ['en-US', 'en']
            });
        }

        // 4. Fingerprint Randomization (Canvas & ClientRects)
        try {
            // Generate a deterministic "noise" value based on device ID
            // We use the device ID from the closure if available, or random if not
            // Since we can't easily pass the ID into this string, we'll use a random seed per session
            // This ensures "Session Isolation" implies "Fingerprint Isolation"
            const noise = Math.random() * 0.0001;

            // Canvas Noise
            const toDataURL = HTMLCanvasElement.prototype.toDataURL;
            HTMLCanvasElement.prototype.toDataURL = function (type) {
                const context = this.getContext('2d');
                if (context) {
                    // Shift a single pixel very slightly to alter the hash
                    const imageData = context.getImageData(0, 0, 1, 1);
                    imageData.data[0] = Math.max(0, Math.min(255, imageData.data[0] + Math.floor(noise * 10)));
                    context.putImageData(imageData, 0, 0);
                }
                return toDataURL.apply(this, arguments);
            };

            // DOM Rect Noise (Micro-precision shifts)
            const getClientRects = Element.prototype.getClientRects;
            Element.prototype.getClientRects = function () {
                const rects = getClientRects.apply(this, arguments);
                // We can't easily modify the DOMRectList directly as it's typically read-only or computed
                // But for some bot scripts, they valid 'getBoundingClientRect'
                return rects;
            };

            const getBoundingClientRect = Element.prototype.getBoundingClientRect;
            Element.prototype.getBoundingClientRect = function () {
                const rect = getBoundingClientRect.apply(this, arguments);
                // Return a proxy to slightly offset the values
                return new Proxy(rect, {
                    get(target, prop) {
                        const val = target[prop];
                        if (typeof val === 'number') {
                            return val + noise;
                        }
                        return val;
                    }
                });
            };
        } catch (e) { }

        // 5. Deep Stealth (PerimeterX / Unusual Activity Fixes)
        try {
            // a) Scrub Automation Attributes (cdc_, webdriver)
            // These are left by ChromeDriver and are major flags
            for (const prop in window) {
                if (prop.startsWith('cdc_') || prop.match(/__webdriver/)) {
                    delete window[prop];
                }
            }

            // b) Mock Window Chrome (Outer Dimensions)
            // Bots often have outerWidth == innerWidth. Real browsers have UI overhead.
            const windowChrome = {
                width: 16, // Vertical scrollbar approx
                height: 80 // Address bar + tabs approx
            };
            Object.defineProperty(window, 'outerWidth', { get: () => window.innerWidth + windowChrome.width });
            Object.defineProperty(window, 'outerHeight', { get: () => window.innerHeight + windowChrome.height });

            // c) Mock Network Information (4G Residential Profile)
            // Data center IPs often lack this or show weird values
            if (!navigator.connection) {
                Object.defineProperty(navigator, 'connection', {
                    get: () => ({
                        effectiveType: '4g',
                        rtt: 50,
                        downlink: 10,
                        saveData: false,
                        addEventListener: () => { },
                        removeEventListener: () => { }
                    })
                });
            }

            // d) Disable WebRTC (Prevent IP Leaks)
            // This stops the browser from revealing the true Local IP via STUN
            ['RTCPeerConnection', 'webkitRTCPeerConnection', 'mozRTCPeerConnection', 'RTCDataChannel'].forEach(api => {
                if (window[api]) {
                    delete window[api];
                }
            });
            if (navigator.mediaDevices) {
                navigator.mediaDevices.getUserMedia = null;
            }

            // e) Spoof Timezone & Locale (Target: America/Los_Angeles)
            // Aligning Digital Persona with Network Fingerprint (US)
            const targetTimezone = 'America/Los_Angeles';

            try {
                const OriginalDTF = Intl.DateTimeFormat;
                Intl.DateTimeFormat = function (locales, options = {}) {
                    options = options || {};
                    options.timeZone = targetTimezone;
                    return new OriginalDTF(locales, options);
                };
                Intl.DateTimeFormat.prototype = OriginalDTF.prototype;

                // Override Date.prototype.getTimezoneOffset (UTC-8 = 480 min)
                Date.prototype.getTimezoneOffset = () => 480;
            } catch (e) { }

            // Spoof Locale to en-US
            Object.defineProperty(navigator, 'language', { get: () => 'en-US' });
            Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });

        } catch (e) { }

        // 5. Hardware & Screen Mocking (Crucial for Mobile)
        try {
            const screenProps = {
                width: ${device.width},
                height: ${device.height},
                availWidth: ${device.width},
                availHeight: ${device.height},
                colorDepth: 24,
                pixelDepth: 24,
                orientation: {
                    angle: 0,
                    type: ${device.width > device.height ? "'landscape-primary'" : "'portrait-primary'"
                }
                            }
                        };

                        // Override window.screen properties
                        for (const [key, value] of Object.entries(screenProps)) {
        if (key === 'orientation') continue; // Handle separately
        Object.defineProperty(screen, key, { get: () => value });
    }

// Override hardware concurrency (CPU cores)
// Most mobile devices have 4-8 cores, but reporting 8 on a desktop is suspicious if it matches exactly
// We'll standardise to 4 for mobile to be safe and consistent
if (${device.type !== 'desktop'}) {
    Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 4 });
    Object.defineProperty(navigator, 'deviceMemory', { get: () => 4 });
}


                         // End of script
                    } catch (e) {
    console.error('[Stealth] Hardware mocking failed', e);
}
                }) ();
`
            webview.executeJavaScript(stealthScript).catch(e => console.error('Stealth injection failed', e))
        }

        webview.addEventListener('dom-ready', handleDomReady)
        return () => {
            webview.removeEventListener('dom-ready', handleDomReady)
            if (timeoutId) clearTimeout(timeoutId)
        }
    }, [address, hasInitialReload, index])

    const isGlobalTouchEnabled = useSelector(selectIsGlobalTouchEnabled);

    // 1. Core Layout Emulation
    // Attaches the CDP Debugger and forces the cross-origin device metrics
    // Does NOT depend on `isGlobalTouchEnabled` so toggling logic doesn't destroy the Debugger Socket!
    useEffect(() => {
        const webview = webviewRef.current
        if (!webview) return

        let webContentsId: number | null = null

        const enableDeviceLayout = async () => {
            // Only apply mobile dimensions formatting via CDP if it is a mobile device
            if (!isMobileDevice) return;

            try {
                // @ts-ignore
                webContentsId = webview.getWebContentsId?.()

                // Engage CDP Emulation natively via main process for layout boundaries
                if (webContentsId && window.api?.enableTouchEmulation) {
                    await window.api.enableTouchEmulation(webContentsId, width, height, true)
                }
            } catch (err) {
                console.error('[Native CDP Layout] Error:', err)
            }
        }

        // Apply native layout metrics 
        webview.addEventListener('dom-ready', enableDeviceLayout)
        webview.addEventListener('did-navigate', enableDeviceLayout)

        return () => {
            webview.removeEventListener('dom-ready', enableDeviceLayout)
            webview.removeEventListener('did-navigate', enableDeviceLayout)

            if (webContentsId && window.api?.disableTouchEmulation) {
                window.api.disableTouchEmulation(webContentsId)
            }
        }
    }, [isMobileDevice, device.name, device.type, width, height])

    // 2. Dynamic Touch State Emulation
    // Tracks Redux Toggle button and commands the existing Debugger to toggle Touch bounds
    // Split into a separate useEffect so toggling it does NOT unmount/detach the layout debugger via cleanup!
    useEffect(() => {
        const webview = webviewRef.current
        if (!webview) return

        const syncTouchState = async () => {
            let wcId: number | null = null;
            try {
                // @ts-ignore
                wcId = webview?.getWebContentsId?.()
            } catch (e) { }

            if (!wcId || !isMobileDevice) return;
            try {
                // @ts-ignore
                if (window.api?.toggleTouchCursor) {
                    // @ts-ignore
                    await window.api.toggleTouchCursor(wcId, isGlobalTouchEnabled as boolean);
                }
            } catch (e) { }
        }

        // Push state dynamically 
        syncTouchState();

        // Re-apply touch layer state on navigation reload
        webview.addEventListener('dom-ready', syncTouchState)
        webview.addEventListener('did-navigate', syncTouchState)

        return () => {
            webview.removeEventListener('dom-ready', syncTouchState)
            webview.removeEventListener('did-navigate', syncTouchState)
        }
    }, [isGlobalTouchEnabled, isMobileDevice])

    // Fix Iframe Responsiveness
    // Inject script to force max-width 100% on iframes and ensure viewport meta
    useEffect(() => {
        const webview = webviewRef.current
        if (!webview) return

        const iframeFixScript = `
    (function () {
        function injectGlobalResponsiveCss() {
            if (document.getElementById('humshakal-responsive-iframe-css')) return;
            const style = document.createElement('style');
            style.id = 'humshakal-responsive-iframe-css';
            style.textContent = \`
                        iframe {
                            max-width: 100% !important;
                            min-width: 0 !important;
                            box-sizing: border-box !important;
                        }
                    \`;
                    document.head.appendChild(style);
                }

                function fixIframes() {
                    injectGlobalResponsiveCss();

                    const iframes = document.querySelectorAll('iframe');
                    iframes.forEach(iframe => {
                        // Let Native Chrome render the iframe according to its mobile device dimensions.
                        // We NO LONGER remove the width attribute because deleting width="100%" causes the iframe to collapse to 300px default width.
                        // 'max-width: 100% !important' injected via CSS is sufficient to prevent horizontal overflow without destroying intended percentages.
                        iframe.style.maxWidth = '100%';

                        // Try to access contentWindow (only works if same-origin or webSecurity disabled)
                        try {
                            const doc = iframe.contentDocument || iframe.contentWindow.document;
                            if (doc) {
                                let meta = doc.querySelector('meta[name="viewport"]');
                                if (!meta) {
                                    meta = doc.createElement('meta');
                                    meta.name = 'viewport';
                                    meta.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0';
                                    doc.head.appendChild(meta);
                                    console.log('[Humshakals] Injected viewport meta into iframe inner doc');
                                }
                            }
                        } catch (e) {
                            // Cross-origin access restricted
                        }
                    });
                }

                // Initial run
                fixIframes();

                // Recalculate on resize and orientation change
                window.addEventListener('resize', fixIframes);
                window.addEventListener('orientationchange', fixIframes);
                
                // Periodically check for new dynamically added iframes
                setInterval(fixIframes, 2000);
            })();
        `;

        const injectIframeFix = async () => {
            try {
                await webview.executeJavaScript(iframeFixScript)
            } catch (e) {
                console.error('Failed to inject iframe fix', e)
            }
        }

        webview.addEventListener('dom-ready', injectIframeFix)
        return () => {
            webview.removeEventListener('dom-ready', injectIframeFix)
        }
    }, [])

    // Setup webview event handlers
    useEffect(() => {
        const webview = webviewRef.current
        if (!webview) return

        const onStartLoading = () => {
            setIsLoading(true)
            setHasError(false)
        }

        const onStopLoading = () => {
            setIsLoading(false)
        }

        const onDidNavigate = (e: Electron.DidNavigateEvent) => {
            if (isPrimary && onNavigate && e.url !== 'about:blank') {
                onNavigate(e.url)
            }
        }

        const onFailLoad = (e: Electron.DidFailLoadEvent) => {
            if (e.errorCode === -3) return
            if (!e.isMainFrame) return

            setHasError(true)
            setErrorMsg(e.errorDescription || 'Failed to load')
            setIsLoading(false)
        }

        const onDevToolsOpened = () => setIsDevToolsOpen(true)
        const onDevToolsClosed = () => setIsDevToolsOpen(false)

        const onConsoleMessage = (e: Electron.ConsoleMessageEvent) => {
            // Skip framework/browser/3rd-party noise — check BOTH message AND source URL
            const msg = e.message.toLowerCase()
            const src = (e.sourceId || '').toLowerCase()
            const NOISE_PATTERNS = [
                'electron security warning', 'electron deprecation warning',
                '[deprecation]', '[intervention]',
                'powered by amp', 'ampproject.org', '[amp]',
                'googletagmanager.com', 'google-analytics.com',
                'googlesyndication.com', 'doubleclick.net', 'securepubads',
                'adsbygoogle', 'pagead', 'pubads',
                'fbevents.js', 'connect.facebook',
                'gpt/m20'
            ]
            const isNoise = NOISE_PATTERNS.some(p => msg.includes(p) || src.includes(p)) ||
                (msg.includes('%c') && msg.includes('font-weight'))
            if (isNoise) return

            // Error Level (2)
            if (e.level === 2) {
                const rules = rulesRef.current
                const filterField = rules.consoleFilterText.trim().toLowerCase()
                // Match filter against the SOURCE URL/domain, supports comma-separated entries
                const source = (e.sourceId || '').toLowerCase()
                const filters = filterField ? filterField.split(',').map(s => s.trim()).filter(Boolean) : []
                const isMatch = filters.length === 0 || filters.some(f => source.includes(f))
                if (isMatch) {
                    dispatch(addCaughtEvent({
                        deviceKey: device.id,
                        event: {
                            type: 'console-error',
                            message: e.message,
                            source: e.sourceId,
                            line: e.line
                        }
                    }))
                    showToast(`Bug caught on ${device.name}!`, 'error')
                }
            }

            // Log/Info/Warning Levels (0, 1) — exact match with comma-separated values
            if (e.level < 2) {
                const rules = rulesRef.current
                const logMatchField = rules.consoleLogMatch.trim()
                if (!logMatchField) return // nothing to match

                // Split comma-separated entries, trim each one
                const matchers = logMatchField.split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
                const trimmedMsg = e.message.trim().toLowerCase()

                // If ANY matcher is a number, enable auto-detection of ALL numeric console.logs
                const hasNumericMatcher = matchers.some(m => /^\d+$/.test(m))
                const isMsgNumeric = /^\d+(\.\d+)?$/.test(trimmedMsg)
                const isNumericMatch = hasNumericMatcher && isMsgNumeric

                // Non-numeric entries use exact match
                const nonNumericMatchers = matchers.filter(m => !/^\d+$/.test(m))
                const isExactMatch = nonNumericMatchers.some(m => trimmedMsg === m)

                if (isNumericMatch || isExactMatch) {
                    dispatch(addCaughtEvent({
                        deviceKey: device.id,
                        event: {
                            type: 'console-log',
                            message: e.message,
                            source: e.sourceId,
                            line: e.line
                        }
                    }))
                    showToast(`Log matched on ${device.name}!`, 'log')
                }
            }
        }

        webview.addEventListener('did-start-loading', onStartLoading)
        webview.addEventListener('did-stop-loading', onStopLoading)
        webview.addEventListener('did-navigate', onDidNavigate)
        webview.addEventListener('did-fail-load', onFailLoad)
        webview.addEventListener('devtools-opened', onDevToolsOpened)
        webview.addEventListener('devtools-closed', onDevToolsClosed)
        webview.addEventListener('console-message', onConsoleMessage)

        // Network request monitoring via IPC from main process
        const cleanupNetwork = window.api.onNetworkRequest((details: any) => {
            // Only process if this webview's webContentsId matches
            const wvWebContentsId = (webview as any).getWebContentsId?.()
            if (wvWebContentsId && details.webContentsId !== wvWebContentsId) return

            const currentRules = rulesRef.current
            const netField = currentRules.networkMatch.trim().toLowerCase()
            if (currentRules.isNetworkEnabled && netField) {
                // Support comma-separated entries: 'coldplay.js, vs.js' matches either
                const netMatchers = netField.split(',').map(s => s.trim()).filter(Boolean)
                // Match only against URL path (ignore query string params to avoid false positives)
                const fullUrl = (details.url || '').toLowerCase()
                const urlPath = fullUrl.split('?')[0]
                if (netMatchers.some(m => urlPath.includes(m))) {
                    dispatch(addCaughtEvent({
                        deviceKey: device.id,
                        event: {
                            type: 'network',
                            message: `[${details.statusCode}] ${details.method} ${details.resourceType}`,
                            url: details.url
                        }
                    }))
                    showToast(`Network matched on ${device.name}!`, 'network')
                }
            }
        })

        return () => {
            webview.removeEventListener('did-start-loading', onStartLoading)
            webview.removeEventListener('did-stop-loading', onStopLoading)
            webview.removeEventListener('did-navigate', onDidNavigate)
            webview.removeEventListener('did-fail-load', onFailLoad)
            webview.removeEventListener('devtools-opened', onDevToolsOpened)
            webview.removeEventListener('devtools-closed', onDevToolsClosed)
            webview.removeEventListener('console-message', onConsoleMessage)
            cleanupNetwork()
        }
    }, [isPrimary, onNavigate])

    // Toolbar handlers
    const handleRefresh = useCallback(() => {
        webviewRef.current?.reload()
    }, [])

    const handleQuickScreenshot = useCallback(async () => {
        const webview = webviewRef.current
        if (!webview) return

        setIsScreenshotLoading(true)
        try {
            const image = await webview.capturePage()
            const dataUrl = image.toDataURL()

            const dateStr = getFormattedDate()
            const domain = getCleanDomain(webview.getURL())
            const dName = cleanString(device.name)

            const filename = `${dName}-${domain}-${dateStr}.png`
            await window.api.saveScreenshot(filename, dataUrl)

            showToast(`Screenshot saved to Pictures/humshakals/${filename}`)
        } catch (e) {
            console.error('Screenshot failed:', e)
        }
        setIsScreenshotLoading(false)
    }, [device.name])



    const handleToggleMirroring = useCallback(() => {
        setIsMirroringOff(!isMirroringOff)
    }, [isMirroringOff])

    const handleOpenDevtools = useCallback(() => {
        // @ts-ignore
        const wcId = webviewRef.current?.getWebContentsId?.()
        if (!wcId) return;

        // @ts-ignore
        if (window.api?.openDevTools) {
            // @ts-ignore
            window.api.openDevTools(wcId, false, device.name)
        } else {
            webviewRef.current?.openDevTools()
        }
    }, [device.name])

    const handleRotate = useCallback(() => {
        setSingleRotated(!singleRotated)
    }, [singleRotated])

    const handleScrollToTop = useCallback(() => {
        webviewRef.current?.executeJavaScript('window.scrollTo({top: 0, behavior: "smooth"})')
    }, [])

    return (
        <div className="device-card flex-shrink-0 relative">
            {isBugPopupOpen && (
                <BugPopup device={device} onClose={() => setIsBugPopupOpen(false)} />
            )}

            {/* Device Header */}
            <div className="device-header flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Icon
                        icon={device.type === 'phone' ? 'mdi:cellphone' :
                            device.type === 'tablet' ? 'mdi:tablet' : 'mdi:monitor'}
                        width={14}
                        className="device-type-icon"
                    />
                    <span className="device-name">{device.name}</span>
                    <span className="device-resolution">{width}×{height}</span>
                </div>
                <div className="device-header-status">

                    {isLoading && <Spinner />}
                </div>
            </div>

            {/* Per-device Toolbar */}
            <DeviceToolbar
                onRefresh={handleRefresh}
                onQuickScreenshot={handleQuickScreenshot}
                onToggleMirroring={handleToggleMirroring}
                onOpenDevtools={handleOpenDevtools}
                onRotate={handleRotate}
                onScrollToTop={handleScrollToTop}
                isMirroringOff={isMirroringOff}
                canRotate={device.isMobileCapable}
                isRotated={singleRotated}
                isScreenshotLoading={isScreenshotLoading}
                isDevToolsOpen={isDevToolsOpen}
                caughtBugCount={caughtBugCount}
                onOpenBugPopup={() => setIsBugPopupOpen(prev => !prev)}
            />

            {/* Viewport Container */}
            <div
                className={`device-viewport relative overflow-hidden border-2 rounded bg-white ${isMobileDevice ? 'touch-device' : ''}`}
                style={{
                    width: scaledWidth,
                    height: scaledHeight,
                    minHeight: scaledHeight,
                    borderColor: 'var(--border-color)'
                }}
            >
                {/* Webview */}
                <webview
                    ref={webviewRef}
                    id={`webview-${device.id}`}
                    data-device-name={device.name}
                    src="about:blank"
                    style={{
                        width: width,
                        height: height,
                        transform: `scale(${zoomFactor})`,
                        transformOrigin: 'top left'
                    }}
                    partition={`persist:device-${device.id}`}
                    useragent={device.userAgent}
                    allowpopups={true}
                    webpreferences="contextIsolation=no, webSecurity=no"
                />

                {/* Error Overlay */}
                {hasError && (
                    <div className="error-overlay">
                        <Icon icon="ic:round-error-outline" width={48} className="text-red-400 mb-4" />
                        <h3 className="text-lg font-semibold text-white mb-2">Failed to load</h3>
                        <p className="text-sm text-gray-400 mb-4">{errorMsg}</p>
                        <button
                            onClick={handleRefresh}
                            className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white text-sm rounded"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Idle State */}
                {!address && (
                    <div className="idle-overlay absolute inset-0 flex items-center justify-center">
                        <p className="text-sm text-muted">Enter URL and click Go</p>
                    </div>
                )}
            </div>
        </div>
    )
}
