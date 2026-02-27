import { RootState } from '..';
import { Device } from '../../data/deviceList';
export interface PreviewSuite {
    id: string;
    name: string;
    deviceIds: string[];
}
export interface DevicesState {
    allDevices: Device[];
    activeSuite: PreviewSuite;
    previewSuites: PreviewSuite[];
}
export declare const loadCustomDevicesAsync: import("@reduxjs/toolkit").AsyncThunk<any, void, import("@reduxjs/toolkit").AsyncThunkConfig>;
export declare const setActiveSuite: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, "devices/setActiveSuite">, toggleDeviceInSuite: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, "devices/toggleDeviceInSuite">, addPreviewSuite: import("@reduxjs/toolkit").ActionCreatorWithPayload<PreviewSuite, "devices/addPreviewSuite">, removeDeviceFromSuite: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, "devices/removeDeviceFromSuite">, addCustomDevice: import("@reduxjs/toolkit").ActionCreatorWithPayload<Device, "devices/addCustomDevice">, removeCustomDevice: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, "devices/removeCustomDevice">;
export declare const selectAllDevices: (state: RootState) => Device[];
export declare const selectActiveSuite: (state: RootState) => PreviewSuite;
export declare const selectActiveDevices: (state: RootState) => Device[];
export declare const selectPreviewSuites: (state: RootState) => PreviewSuite[];
declare const _default: import("redux").Reducer<DevicesState>;
export default _default;
