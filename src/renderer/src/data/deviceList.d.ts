export interface Device {
    id: string;
    name: string;
    width: number;
    height: number;
    dpr: number;
    userAgent: string;
    type: 'phone' | 'tablet' | 'desktop';
    isTouchCapable: boolean;
    isMobileCapable: boolean;
    customScale?: number;
}
export declare const defaultDevices: Device[];
export declare const getDeviceById: (id: string) => Device | undefined;
export declare const getDevicesByType: (type: Device["type"]) => Device[];
