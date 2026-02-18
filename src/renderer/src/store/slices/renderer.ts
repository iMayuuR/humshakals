import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '..'

interface RendererState {
    address: string
    isInspecting: boolean
    rotateDevices: boolean
    zoomFactor: number
    isCapturingScreenshot: boolean
}

const initialState: RendererState = {
    address: '',
    isInspecting: false,
    rotateDevices: false,
    zoomFactor: 0.5,
    isCapturingScreenshot: false
}

const rendererSlice = createSlice({
    name: 'renderer',
    initialState,
    reducers: {
        setAddress: (state, action: PayloadAction<string>) => {
            state.address = action.payload
        },
        setIsInspecting: (state, action: PayloadAction<boolean>) => {
            state.isInspecting = action.payload
        },
        setRotateDevices: (state, action: PayloadAction<boolean>) => {
            state.rotateDevices = action.payload
        },
        setZoomFactor: (state, action: PayloadAction<number>) => {
            state.zoomFactor = action.payload
        },
        setIsCapturingScreenshot: (state, action: PayloadAction<boolean>) => {
            state.isCapturingScreenshot = action.payload
        }
    }
})

export const {
    setAddress,
    setIsInspecting,
    setRotateDevices,
    setZoomFactor,
    setIsCapturingScreenshot
} = rendererSlice.actions

export const selectAddress = (state: RootState) => state.renderer.address
export const selectIsInspecting = (state: RootState) => state.renderer.isInspecting
export const selectRotateDevices = (state: RootState) => state.renderer.rotateDevices
export const selectZoomFactor = (state: RootState) => state.renderer.zoomFactor
export const selectIsCapturingScreenshot = (state: RootState) => state.renderer.isCapturingScreenshot

export default rendererSlice.reducer
