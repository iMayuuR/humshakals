export declare const store: import("@reduxjs/toolkit").EnhancedStore<{
    devices: import("./slices/devices").DevicesState;
    renderer: import("./slices/renderer").RendererState;
    ui: import("./slices/ui").UIState;
}, import("redux").UnknownAction, import("@reduxjs/toolkit").Tuple<[import("redux").StoreEnhancer<{
    dispatch: import("redux-thunk").ThunkDispatch<{
        devices: import("./slices/devices").DevicesState;
        renderer: import("./slices/renderer").RendererState;
        ui: import("./slices/ui").UIState;
    }, undefined, import("redux").UnknownAction>;
}>, import("redux").StoreEnhancer]>>;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
