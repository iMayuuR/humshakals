import { RootState } from '..';
export interface RendererState {
    address: string;
    isInspecting: boolean;
    rotateDevices: boolean;
    zoomFactor: number;
    isCapturingScreenshot: boolean;
    isGlobalTouchEnabled: boolean;
}
export declare const setAddress: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, "renderer/setAddress">, setIsInspecting: import("@reduxjs/toolkit").ActionCreatorWithPayload<boolean, "renderer/setIsInspecting">, setRotateDevices: import("@reduxjs/toolkit").ActionCreatorWithPayload<boolean, "renderer/setRotateDevices">, setZoomFactor: import("@reduxjs/toolkit").ActionCreatorWithPayload<number, "renderer/setZoomFactor">, setIsCapturingScreenshot: import("@reduxjs/toolkit").ActionCreatorWithPayload<boolean, "renderer/setIsCapturingScreenshot">, setIsGlobalTouchEnabled: import("@reduxjs/toolkit").ActionCreatorWithPayload<boolean, "renderer/setIsGlobalTouchEnabled">;
export declare const selectAddress: (state: RootState) => string;
export declare const selectIsInspecting: (state: RootState) => boolean;
export declare const selectRotateDevices: (state: RootState) => boolean;
export declare const selectZoomFactor: (state: RootState) => number;
export declare const selectIsCapturingScreenshot: (state: RootState) => boolean;
export declare const selectIsGlobalTouchEnabled: (state: RootState) => boolean;
declare const _default: import("redux").Reducer<RendererState>;
export default _default;
