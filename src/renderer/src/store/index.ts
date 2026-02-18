import { configureStore } from '@reduxjs/toolkit'
import devicesReducer from './slices/devices'
import rendererReducer from './slices/renderer'
import uiReducer from './slices/ui'

export const store = configureStore({
    reducer: {
        devices: devicesReducer,
        renderer: rendererReducer,
        ui: uiReducer
    }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
