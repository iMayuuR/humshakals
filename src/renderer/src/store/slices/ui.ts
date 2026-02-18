import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '..'

type ColorScheme = 'light' | 'dark' | 'system'

interface UIState {
    colorScheme: ColorScheme
    showDeviceManager: boolean
    showAboutModal: boolean
}

const initialState: UIState = {
    colorScheme: 'dark',
    showDeviceManager: false,
    showAboutModal: false
}

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        setColorScheme: (state, action: PayloadAction<ColorScheme>) => {
            state.colorScheme = action.payload
        },
        toggleColorScheme: (state) => {
            state.colorScheme = state.colorScheme === 'dark' ? 'light' : 'dark'
        },
        toggleDeviceManager: (state) => {
            state.showDeviceManager = !state.showDeviceManager
        },
        setShowDeviceManager: (state, action: PayloadAction<boolean>) => {
            state.showDeviceManager = action.payload
        },
        toggleAboutModal: (state) => {
            state.showAboutModal = !state.showAboutModal
        },
        setShowAboutModal: (state, action: PayloadAction<boolean>) => {
            state.showAboutModal = action.payload
        }
    }
})

export const { setColorScheme, toggleColorScheme, toggleDeviceManager, setShowDeviceManager, toggleAboutModal, setShowAboutModal } = uiSlice.actions

export const selectColorScheme = (state: RootState) => state.ui.colorScheme
export const selectShowDeviceManager = (state: RootState) => state.ui.showDeviceManager
export const selectShowAboutModal = (state: RootState) => state.ui.showAboutModal

export default uiSlice.reducer
