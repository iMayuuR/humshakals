import { Device } from '../../../data/deviceList';
interface DevicePreviewProps {
    device: Device;
    isPrimary: boolean;
    index: number;
    onNavigate?: (url: string) => void;
}
export declare const DevicePreview: ({ device, isPrimary, index, onNavigate }: DevicePreviewProps) => import("react/jsx-runtime").JSX.Element;
export {};
