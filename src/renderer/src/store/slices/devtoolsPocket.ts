import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../index'

export interface CaughtEvent {
    id: string;
    type: 'console-error' | 'console-log' | 'network';
    timestamp: number;
    message: string;
    source?: string;
    line?: number;
    url?: string;
}

export interface DevToolsPocketRules {
    consoleFilterText: string;
    consoleLogMatch: string;
    networkMatch: string;
    isNetworkEnabled: boolean;
}

export interface DevToolsPocketState {
    rules: DevToolsPocketRules;
    caughtEvents: Record<string, CaughtEvent[]>;
    isGlobalModalOpen: boolean;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const defaultRules: DevToolsPocketRules = {
    consoleFilterText: '',
    consoleLogMatch: '',
    networkMatch: '',
    isNetworkEnabled: false
}

const initialState: DevToolsPocketState = {
    rules: defaultRules,
    caughtEvents: {},
    isGlobalModalOpen: false,
    status: 'idle'
}

// Thunk to load rules from main process fs
export const loadDevToolsRulesAsync = createAsyncThunk<DevToolsPocketRules>(
    'devtoolsPocket/loadRules',
    async () => {
        // @ts-ignore
        const savedRules = await window.api?.storeGet('devtoolsPocketRules')
        if (savedRules) {
            return { ...defaultRules, ...savedRules }
        }
        return defaultRules
    }
)

// Helper to save rules
const saveRulesToStore = (rules: DevToolsPocketRules) => {
    // @ts-ignore
    window.api?.storeSet('devtoolsPocketRules', rules)
}

export const devtoolsPocketSlice = createSlice({
    name: 'devtoolsPocket',
    initialState,
    reducers: {
        setRules: (state, action: PayloadAction<Partial<DevToolsPocketRules>>) => {
            state.rules = { ...state.rules, ...action.payload }
            saveRulesToStore(state.rules)
        },
        toggleGlobalModal: (state, action: PayloadAction<boolean | undefined>) => {
            state.isGlobalModalOpen = action.payload !== undefined ? action.payload : !state.isGlobalModalOpen
        },
        addCaughtEvent: (state, action: PayloadAction<{ deviceKey: string, event: Omit<CaughtEvent, 'id' | 'timestamp'> }>) => {
            const { deviceKey, event } = action.payload;
            if (!state.caughtEvents[deviceKey]) {
                state.caughtEvents[deviceKey] = [];
            }
            state.caughtEvents[deviceKey].push({
                ...event,
                id: crypto.randomUUID(),
                timestamp: Date.now()
            });
            // SECURITY: Cap at 500 events per device to prevent unbounded memory growth
            if (state.caughtEvents[deviceKey].length > 500) {
                state.caughtEvents[deviceKey] = state.caughtEvents[deviceKey].slice(-500)
            }
        },
        clearDeviceEvents: (state, action: PayloadAction<string>) => {
            state.caughtEvents[action.payload] = [];
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(loadDevToolsRulesAsync.pending, (state) => {
                state.status = 'loading'
            })
            .addCase(loadDevToolsRulesAsync.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.rules = action.payload
            })
            .addCase(loadDevToolsRulesAsync.rejected, (state) => {
                state.status = 'failed'
            })
    }
})

export const { setRules, toggleGlobalModal, addCaughtEvent, clearDeviceEvents } = devtoolsPocketSlice.actions

export const selectDevToolsRules = (state: RootState) => state.devtoolsPocket.rules
export const selectIsGlobalModalOpen = (state: RootState) => state.devtoolsPocket.isGlobalModalOpen
export const selectDeviceCaughtEvents = (deviceKey: string) => (state: RootState) => state.devtoolsPocket.caughtEvents[deviceKey] || []

export default devtoolsPocketSlice.reducer
