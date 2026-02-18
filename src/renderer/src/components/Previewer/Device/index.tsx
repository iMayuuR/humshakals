import { useRef, useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { Device } from '../../../data/deviceList'
import { selectRotateDevices, selectZoomFactor, selectAddress } from '../../../store/slices/renderer'
import { DeviceToolbar } from './Toolbar'
import { Spinner } from '../../Button'
import { Icon } from '@iconify/react'

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
    const webviewRef = useRef<Electron.WebviewTag>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [hasError, setHasError] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')
    const [singleRotated, setSingleRotated] = useState(false)
    const [isMirroringOff, setIsMirroringOff] = useState(false)
    const [isScreenshotLoading, setIsScreenshotLoading] = useState(false)
    const [touchEnabled, setTouchEnabled] = useState(false)
    const [hasInitialReload, setHasInitialReload] = useState(false)

    const address = useSelector(selectAddress)
    const globalRotate = useSelector(selectRotateDevices)
    const zoomFactor = useSelector(selectZoomFactor)

    // Check if device is mobile (phone or tablet)
    const isMobileDevice = device.type === 'phone' || device.type === 'tablet'

    // Determine if device is rotated
    const isRotated = device.isMobileCapable && (globalRotate || singleRotated)

    // Calculate dimensions
    let width = device.width
    let height = device.height
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
        if (!webview) return () => { }

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
                console.log(`[AutoReload] Triggering one-time reload for ${device.name}`)
                setHasInitialReload(true)
                // Small delay to ensure current load handles processing
                setTimeout(() => {
                    webview.reload()
                }, 500)
            }

            // Device-Aware Stealth Mode Injection
            const stealthScript = `
                (function() {
                    // SILENT MODE: No console logs to avoid detection

                    // 1. Remove navigator.webdriver (Common)
                    try {
                        const proto = Object.getPrototypeOf(navigator);
                        if (proto && proto.webdriver) {
                            delete proto.webdriver;
                        } else {
                            delete navigator.webdriver;
                        }
                    } catch (e) {}

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
                        WebGLRenderingContext.prototype.getParameter = function(parameter) {
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
                         WebGLRenderingContext.prototype.getParameter = function(parameter) {
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
                            WebGLRenderingContext.prototype.getParameter = function(parameter) {
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
                            window.Touch = function Touch() {};
                            window.TouchEvent = function TouchEvent() {};
                            window.TouchList = function TouchList() {};
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
                        HTMLCanvasElement.prototype.toDataURL = function(type) {
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
                        Element.prototype.getClientRects = function() {
                            const rects = getClientRects.apply(this, arguments);
                            // We can't easily modify the DOMRectList directly as it's typically read-only or computed
                            // But for some bot scripts, they valid 'getBoundingClientRect'
                            return rects; 
                        };
                        
                        const getBoundingClientRect = Element.prototype.getBoundingClientRect;
                         Element.prototype.getBoundingClientRect = function() {
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
                    } catch (e) {}

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
                                    addEventListener: () => {},
                                    removeEventListener: () => {}
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
                            Intl.DateTimeFormat = function(locales, options = {}) {
                                options = options || {};
                                options.timeZone = targetTimezone;
                                return new OriginalDTF(locales, options);
                            };
                            Intl.DateTimeFormat.prototype = OriginalDTF.prototype;
                            
                            // Override Date.prototype.getTimezoneOffset (UTC-8 = 480 min)
                            Date.prototype.getTimezoneOffset = () => 480; 
                        } catch (e) {}

                        // Spoof Locale to en-US
                        Object.defineProperty(navigator, 'language', { get: () => 'en-US' });
                        Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });

                    } catch(e) {}

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
                                type: ${device.width > device.height ? "'landscape-primary'" : "'portrait-primary'"}
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
                })();
            `
            webview.executeJavaScript(stealthScript).catch(e => console.error('Stealth injection failed', e))
        }

        webview.addEventListener('dom-ready', handleDomReady)
        return () => {
            webview.removeEventListener('dom-ready', handleDomReady)
            if (timeoutId) clearTimeout(timeoutId)
        }
    }, [address, hasInitialReload, index])


    // Enable touch emulation for mobile devices
    // Uses device emulation via IPC + JS injection for touch cursor
    useEffect(() => {
        const webview = webviewRef.current
        if (!webview || !isMobileDevice) return

        let webContentsId: number | null = null

        // JS script for touch cursor and drag-to-scroll (Supports iframes)
        const touchCursorScript = `
            (function() {
                // Core Touch Logic
                function initTouch(win, doc) {
                    if (win.__touchEmulationEnabled) return;
                    win.__touchEmulationEnabled = true;

                    // Add styles for touch cursor
                    const style = doc.createElement('style');
                    style.textContent = \`
                        #__touch-cursor {
                            position: fixed;
                            width: 20px;
                            height: 20px;
                            border-radius: 50%;
                            background: rgba(100, 100, 100, 0.4);
                            border: 1px solid rgba(50, 50, 50, 0.6);
                            pointer-events: none;
                            z-index: 2147483647;
                            transform: translate(-50%, -50%);
                            transition: width 0.1s, height 0.1s, background 0.1s;
                            display: none;
                        }
                        #__touch-cursor.visible { display: block; }
                        #__touch-cursor.pressed {
                            width: 16px;
                            height: 16px;
                            background: rgba(80, 80, 80, 0.6);
                        }
                    \`;
                    doc.head.appendChild(style);

                    // Create cursor element
                    const cursor = doc.createElement('div');
                    cursor.id = '__touch-cursor';
                    doc.body.appendChild(cursor);

                    // State
                    let isDragging = false;
                    let didScroll = false;
                    let lastX = 0, lastY = 0;
                    let scrollTarget = null;
                    
                    // Momentum variables
                    let velocityX = 0, velocityY = 0;
                    let lastTime = 0;
                    let animationId = null;

                    // Find scrollable parent (horizontal or vertical)
                    function getScrollableParent(el) {
                        while (el && el !== doc.body && el !== doc.documentElement) {
                            const style = win.getComputedStyle(el);
                            const overflowX = style.overflowX;
                            const overflowY = style.overflowY;
                            
                            // Check for horizontal scroll
                            if ((overflowX === 'auto' || overflowX === 'scroll') && el.scrollWidth > el.clientWidth) {
                                return el;
                            }
                            // Check for vertical scroll
                            if ((overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight) {
                                return el;
                            }
                            el = el.parentElement;
                        }
                        return null;
                    }

                    // Momentum animation
                    function animateMomentum() {
                        if (Math.abs(velocityX) < 0.5 && Math.abs(velocityY) < 0.5) {
                            animationId = null;
                            return;
                        }
                        
                        if (scrollTarget) {
                            scrollTarget.scrollLeft += velocityX;
                            scrollTarget.scrollTop += velocityY;
                        } else {
                            win.scrollBy(velocityX, velocityY);
                        }
                        
                        // Deceleration
                        velocityX *= 0.92;
                        velocityY *= 0.92;
                        
                        animationId = win.requestAnimationFrame(animateMomentum);
                    }

                    // Update cursor position and handle drag scroll
                    doc.addEventListener('mousemove', (e) => {
                        cursor.style.left = e.clientX + 'px';
                        cursor.style.top = e.clientY + 'px';
                        
                        if (isDragging) {
                            const now = Date.now();
                            const dt = now - lastTime || 16;
                            
                            const dx = lastX - e.clientX;
                            const dy = lastY - e.clientY;
                            
                            if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
                                didScroll = true;
                                
                                // Track velocity for momentum
                                velocityX = dx * (16 / dt);
                                velocityY = dy * (16 / dt);
                                
                                if (scrollTarget) {
                                    scrollTarget.scrollLeft += dx;
                                    scrollTarget.scrollTop += dy;
                                } else {
                                    win.scrollBy(dx, dy);
                                }
                            }
                            
                            lastX = e.clientX;
                            lastY = e.clientY;
                            lastTime = now;
                        }
                    }, true);

                    // Mouse down - start drag, find scroll target
                    doc.addEventListener('mousedown', (e) => {
                        cursor.classList.add('pressed');
                        
                        // Cancel any ongoing momentum
                        if (animationId) {
                            win.cancelAnimationFrame(animationId);
                            animationId = null;
                        }
                        velocityX = 0;
                        velocityY = 0;
                        
                        const tag = e.target.tagName.toLowerCase();
                        if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable) {
                            return;
                        }
                        
                        isDragging = true;
                        didScroll = false;
                        lastX = e.clientX;
                        lastY = e.clientY;
                        lastTime = Date.now();
                        
                        scrollTarget = getScrollableParent(e.target);
                    }, true);

                    // Mouse up - start momentum
                    doc.addEventListener('mouseup', () => {
                        cursor.classList.remove('pressed');
                        
                        if (isDragging && didScroll && (Math.abs(velocityX) > 1 || Math.abs(velocityY) > 1)) {
                            // Start momentum animation
                            animateMomentum();
                        }
                        
                        isDragging = false;
                        didScroll = false;
                    }, true);

                    // Show/hide cursor
                    doc.addEventListener('mouseenter', () => cursor.classList.add('visible'));
                    doc.addEventListener('mouseleave', () => {
                        cursor.classList.remove('visible', 'pressed');
                        isDragging = false;
                        scrollTarget = null;
                    });

                    // Prevent text selection during drag
                    doc.addEventListener('selectstart', (e) => {
                        if (isDragging) e.preventDefault();
                    });

                    console.log('[Touch] Cursor & scroll enabled for', win.location.href);
                }

                // Initialize on main window
                initTouch(window, document);

                // Helper to check and init iframes
                function checkIframes() {
                    const iframes = document.querySelectorAll('iframe');
                    iframes.forEach(iframe => {
                        try {
                            // Only works for same-origin or if webSecurity is disabled
                            const win = iframe.contentWindow;
                            const doc = iframe.contentDocument || iframe.contentWindow.document;
                            
                            if (win && doc && !win.__touchEmulationEnabled) {
                                initTouch(win, doc);
                            }
                        } catch (e) {
                            // Cross-origin access restricted
                        }
                    });
                }
                
                // Check periodically to catch dynamic updates
                setInterval(checkIframes, 2000);
                
                // Observe DOM changes
                const observer = new MutationObserver(checkIframes);
                observer.observe(document.body, { childList: true, subtree: true });
            })();
        `;

        const enableTouchEmulation = async () => {
            try {
                // Get webContentsId
                // @ts-ignore
                webContentsId = webview.getWebContentsId?.()

                // Enable device emulation via main process (if API available)
                if (webContentsId && window.api?.enableTouchEmulation) {
                    await window.api.enableTouchEmulation(webContentsId, width, height, true)
                }

                // Inject touch cursor script
                await webview.executeJavaScript(touchCursorScript)
                setTouchEnabled(true)
                console.log(`[Touch] Enabled for ${device.name} (${device.type})`)
            } catch (err) {
                console.error('[Touch] Error:', err)
            }
        }

        // Enable on dom-ready and navigation
        webview.addEventListener('dom-ready', enableTouchEmulation)
        webview.addEventListener('did-navigate', enableTouchEmulation)

        return () => {
            webview.removeEventListener('dom-ready', enableTouchEmulation)
            webview.removeEventListener('did-navigate', enableTouchEmulation)
            if (webContentsId && window.api?.disableTouchEmulation) {
                window.api.disableTouchEmulation(webContentsId)
            }
        }
    }, [isMobileDevice, device.name, device.type, width, height])

    // Fix Iframe Responsiveness
    // Inject script to force max-width 100% on iframes and ensure viewport meta
    useEffect(() => {
        const webview = webviewRef.current
        if (!webview) return

        const iframeFixScript = `
            (function() {
                function fixIframes() {
                    const iframes = document.querySelectorAll('iframe');
                    iframes.forEach(iframe => {
                        // Force responsive width
                        if (!iframe.style.maxWidth) {
                            iframe.style.maxWidth = '100%';
                        }
                        
                        // Try to access contentWindow (only works if same-origin or webSecurity disabled)
                        try {
                            const doc = iframe.contentDocument || iframe.contentWindow.document;
                            if (doc && !doc.querySelector('meta[name="viewport"]')) {
                                const meta = doc.createElement('meta');
                                meta.name = 'viewport';
                                meta.content = 'width=device-width, initial-scale=1.0';
                                doc.head.appendChild(meta);
                                console.log('[Humshakals] Injected viewport meta into iframe');
                            }
                        } catch (e) {
                            // Cross-origin access restricted
                        }
                    });
                }

                // Run on load and periodically to catch dynamic iframes
                fixIframes();
                setInterval(fixIframes, 2000);
                
                // Also observe DOM changes
                const observer = new MutationObserver(fixIframes);
                observer.observe(document.body, { childList: true, subtree: true });
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

        webview.addEventListener('did-start-loading', onStartLoading)
        webview.addEventListener('did-stop-loading', onStopLoading)
        webview.addEventListener('did-navigate', onDidNavigate)
        webview.addEventListener('did-fail-load', onFailLoad)

        return () => {
            webview.removeEventListener('did-start-loading', onStartLoading)
            webview.removeEventListener('did-stop-loading', onStopLoading)
            webview.removeEventListener('did-navigate', onDidNavigate)
            webview.removeEventListener('did-fail-load', onFailLoad)
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

            const link = document.createElement('a')
            link.href = dataUrl
            link.download = `${device.name.replace(/\s+/g, '_')}_viewport_${Date.now()}.png`
            link.click()
        } catch (e) {
            console.error('Screenshot failed:', e)
        }
        setIsScreenshotLoading(false)
    }, [device.name])



    const handleToggleMirroring = useCallback(() => {
        setIsMirroringOff(!isMirroringOff)
    }, [isMirroringOff])

    const handleOpenDevtools = useCallback(() => {
        webviewRef.current?.openDevTools()
    }, [])

    const handleRotate = useCallback(() => {
        setSingleRotated(!singleRotated)
    }, [singleRotated])

    const handleScrollToTop = useCallback(() => {
        webviewRef.current?.executeJavaScript('window.scrollTo({top: 0, behavior: "smooth"})')
    }, [])

    return (
        <div className="device-card flex-shrink-0">
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
                showTouchIcon={isMobileDevice && touchEnabled}
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
