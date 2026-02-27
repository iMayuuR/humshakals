import { RootState } from '..';
type ColorScheme = 'light' | 'dark' | 'system';
export interface UIState {
    colorScheme: ColorScheme;
    showDeviceManager: boolean;
    showAboutModal: boolean;
}
export declare const setColorScheme: import("@reduxjs/toolkit").ActionCreatorWithPayload<ColorScheme, "ui/setColorScheme">, toggleColorScheme: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"ui/toggleColorScheme">, toggleDeviceManager: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"ui/toggleDeviceManager">, setShowDeviceManager: import("@reduxjs/toolkit").ActionCreatorWithPayload<boolean, "ui/setShowDeviceManager">, toggleAboutModal: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"ui/toggleAboutModal">, setShowAboutModal: import("@reduxjs/toolkit").ActionCreatorWithPayload<boolean, "ui/setShowAboutModal">;
export declare const selectColorScheme: (state: RootState) => ColorScheme;
export declare const selectShowDeviceManager: (state: RootState) => boolean;
export declare const selectShowAboutModal: (state: RootState) => boolean;
declare const _default: import("redux").Reducer<UIState>;
export default _default;
