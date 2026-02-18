import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '..'
import { Device, defaultDevices } from '../../data/deviceList'

export interface PreviewSuite {
    id: string
    name: string
    deviceIds: string[]
}

export interface DevicesState {
    allDevices: Device[]
    activeSuite: PreviewSuite
    previewSuites: PreviewSuite[]
}

const defaultSuite: PreviewSuite = {
    id: 'default',
    name: 'Default',
    // Start with just 3 devices - more load on-demand when selected
    deviceIds: [
        '10003',  // iPhone SE
        '10010',  // iPhone 14 Pro Max  
        '90002',  // Desktop 1080p
    ]
}

const initialState: DevicesState = {
    allDevices: defaultDevices,
    activeSuite: defaultSuite,
    previewSuites: [defaultSuite]
}

const devicesSlice = createSlice({
    name: 'devices',
    initialState,
    reducers: {
        setActiveSuite: (state, action: PayloadAction<string>) => {
            const suite = state.previewSuites.find(s => s.id === action.payload)
            if (suite) {
                state.activeSuite = suite
            }
        },
        toggleDeviceInSuite: (state, action: PayloadAction<string>) => {
            const deviceId = action.payload
            const idx = state.activeSuite.deviceIds.indexOf(deviceId)
            if (idx >= 0) {
                state.activeSuite.deviceIds.splice(idx, 1)
            } else {
                state.activeSuite.deviceIds.push(deviceId)
            }
        },
        addPreviewSuite: (state, action: PayloadAction<PreviewSuite>) => {
            state.previewSuites.push(action.payload)
        },
        removeDeviceFromSuite: (state, action: PayloadAction<string>) => {
            state.activeSuite.deviceIds = state.activeSuite.deviceIds.filter(id => id !== action.payload)
        }
    }
})

export const { setActiveSuite, toggleDeviceInSuite, addPreviewSuite, removeDeviceFromSuite } = devicesSlice.actions

export const selectAllDevices = (state: RootState) => state.devices.allDevices
export const selectActiveSuite = (state: RootState) => state.devices.activeSuite
export const selectActiveDevices = (state: RootState) => {
    const deviceMap = new Map(state.devices.allDevices.map(d => [d.id, d]))
    return state.devices.activeSuite.deviceIds.map(id => deviceMap.get(id)).filter(Boolean) as Device[]
}
export const selectPreviewSuites = (state: RootState) => state.devices.previewSuites

export default devicesSlice.reducer
