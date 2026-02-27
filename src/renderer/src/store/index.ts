import { configureStore } from '@reduxjs/toolkit'
import devicesReducer from './slices/devices'
import rendererReducer from './slices/renderer'
import uiReducer from './slices/ui'
import devtoolsPocketReducer from './slices/devtoolsPocket'

export const store = configureStore({
    reducer: {
        devices: devicesReducer,
        renderer: rendererReducer,
        ui: uiReducer,
        devtoolsPocket: devtoolsPocketReducer
    }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
