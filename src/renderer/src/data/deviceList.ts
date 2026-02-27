export interface Device {
    id: string
    name: string
    width: number
    height: number
    dpr: number
    userAgent: string
    type: 'phone' | 'tablet' | 'desktop'
    isTouchCapable: boolean
    isMobileCapable: boolean
    customScale?: number
}

// Device profiles matching Responsively App
export const defaultDevices: Device[] = [
    // Apple Phones
    {
        id: '10003',
        name: 'iPhone SE',
        width: 375,
        height: 667,
        dpr: 2,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
        type: 'phone',
        isTouchCapable: true,
        isMobileCapable: true
    },
    {
        id: '10008',
        name: 'iPhone 12 Pro',
        width: 390,
        height: 844,
        dpr: 3,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
        type: 'phone',
        isTouchCapable: true,
        isMobileCapable: true
    },
    {
        id: '10009',
        name: 'iPhone 13 Pro Max',
        width: 428,
        height: 926,
        dpr: 3,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
        type: 'phone',
        isTouchCapable: true,
        isMobileCapable: true
    },
    {
        id: '10010',
        name: 'iPhone 14 Pro Max',
        width: 430,
        height: 932,
        dpr: 3,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
        type: 'phone',
        isTouchCapable: true,
        isMobileCapable: true
    },
    {
        id: '10015',
        name: 'iPhone 16 Pro Max',
        width: 440,
        height: 956,
        dpr: 3,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
        type: 'phone',
        isTouchCapable: true,
        isMobileCapable: true
    },
    // Google Phones
    {
        id: '20001',
        name: 'Pixel 5',
        width: 393,
        height: 851,
        dpr: 2.75,
        userAgent: 'Mozilla/5.0 (Linux; Android 12; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Mobile Safari/537.36',
        type: 'phone',
        isTouchCapable: true,
        isMobileCapable: true
    },
    {
        id: '20002',
        name: 'Pixel 7',
        width: 412,
        height: 915,
        dpr: 2.625,
        userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Mobile Safari/537.36',
        type: 'phone',
        isTouchCapable: true,
        isMobileCapable: true
    },
    // Samsung Phones
    {
        id: '30001',
        name: 'Galaxy S21',
        width: 360,
        height: 800,
        dpr: 3,
        userAgent: 'Mozilla/5.0 (Linux; Android 12; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Mobile Safari/537.36',
        type: 'phone',
        isTouchCapable: true,
        isMobileCapable: true
    },
    {
        id: '30002',
        name: 'Galaxy S22 Ultra',
        width: 384,
        height: 824,
        dpr: 3,
        userAgent: 'Mozilla/5.0 (Linux; Android 12; SM-S908B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Mobile Safari/537.36',
        type: 'phone',
        isTouchCapable: true,
        isMobileCapable: true
    },
    {
        id: '30003',
        name: 'Galaxy S25 Ultra',
        width: 412,
        height: 915,
        dpr: 3.5,
        userAgent: 'Mozilla/5.0 (Linux; Android 15; SM-S938B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
        type: 'phone',
        isTouchCapable: true,
        isMobileCapable: true
    },
    {
        id: '30004',
        name: 'Galaxy S25',
        width: 393,
        height: 873,
        dpr: 3,
        userAgent: 'Mozilla/5.0 (Linux; Android 15; SM-S931B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
        type: 'phone',
        isTouchCapable: true,
        isMobileCapable: true
    },
    // Apple Tablets
    {
        id: '10011',
        name: 'iPad Air',
        width: 820,
        height: 1180,
        dpr: 2,
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
        type: 'tablet',
        isTouchCapable: true,
        isMobileCapable: true
    },
    {
        id: '10012',
        name: 'iPad Pro 11"',
        width: 834,
        height: 1194,
        dpr: 2,
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
        type: 'tablet',
        isTouchCapable: true,
        isMobileCapable: true
    },
    {
        id: '10013',
        name: 'iPad Pro 12.9"',
        width: 1024,
        height: 1366,
        dpr: 2,
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
        type: 'tablet',
        isTouchCapable: true,
        isMobileCapable: true
    },
    {
        id: '10016',
        name: 'iPad Pro 13\" M4',
        width: 1032,
        height: 1376,
        dpr: 2,
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
        type: 'tablet',
        isTouchCapable: true,
        isMobileCapable: true
    },
    // Samsung Tablets
    {
        id: '30010',
        name: 'Galaxy Tab S7',
        width: 800,
        height: 1280,
        dpr: 2,
        userAgent: 'Mozilla/5.0 (Linux; Android 11; SM-T870) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36',
        type: 'tablet',
        isTouchCapable: true,
        isMobileCapable: true
    },
    // Desktops
    {
        id: '90001',
        name: 'Desktop HD',
        width: 1280,
        height: 800,
        dpr: 1,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36',
        type: 'desktop',
        isTouchCapable: false,
        isMobileCapable: false
    },
    {
        id: '90002',
        name: 'Desktop 1080p',
        width: 1920,
        height: 1080,
        dpr: 1,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36',
        type: 'desktop',
        isTouchCapable: false,
        isMobileCapable: false
    },
    {
        id: '90003',
        name: 'Desktop 1440p',
        width: 2560,
        height: 1440,
        dpr: 1,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36',
        type: 'desktop',
        isTouchCapable: false,
        isMobileCapable: false
    },
    {
        id: '90004',
        name: 'Desktop 4K',
        width: 3840,
        height: 2160,
        dpr: 1,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36',
        type: 'desktop',
        isTouchCapable: false,
        isMobileCapable: false
    },
    {
        id: '90005',
        name: 'Desktop 1080p @150%',
        width: 1280,  // 1920/1.5 = effective width at 150% scale
        height: 720,  // 1080/1.5 = effective height at 150% scale
        dpr: 1.5,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36',
        type: 'desktop',
        isTouchCapable: false,
        isMobileCapable: false
    },
    {
        id: '90006',
        name: 'Desktop 1200p @150%',
        width: 1280,  // 1920/1.5 = effective width at 150% scale
        height: 800,  // 1200/1.5 = effective height at 150% scale
        dpr: 1.5,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36',
        type: 'desktop',
        isTouchCapable: false,
        isMobileCapable: false
    },
    {
        id: '90007',
        name: 'Lenovo Small Thinkpad',
        width: 1280,
        height: 585,
        dpr: 1.5,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36',
        type: 'desktop',
        isTouchCapable: false,
        isMobileCapable: false
    },
    // MacBooks
    {
        id: '90010',
        name: 'MacBook Air',
        width: 1440,
        height: 900,
        dpr: 2,
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Safari/605.1.15',
        type: 'desktop',
        isTouchCapable: false,
        isMobileCapable: false
    },
    {
        id: '90011',
        name: 'MacBook Pro 14"',
        width: 1512,
        height: 982,
        dpr: 2,
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Safari/605.1.15',
        type: 'desktop',
        isTouchCapable: false,
        isMobileCapable: false
    },
    {
        id: '90012',
        name: 'MacBook Pro 16"',
        width: 1728,
        height: 1117,
        dpr: 2,
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Safari/605.1.15',
        type: 'desktop',
        isTouchCapable: false,
        isMobileCapable: false
    }
]

export const getDeviceById = (id: string): Device | undefined => {
    return defaultDevices.find(d => d.id === id)
}

export const getDevicesByType = (type: Device['type']): Device[] => {
    return defaultDevices.filter(d => d.type === type)
}
