import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { RootState } from '..'

export interface Bookmark {
    url: string
    title: string
}

export interface BookmarksState {
    list: Bookmark[]
}

export const loadBookmarksAsync = createAsyncThunk(
    'bookmarks/loadBookmarks',
    async () => {
        // @ts-ignore
        const stored = await window.api.storeGet('humshakals_bookmarks')
        return stored ? stored : []
    }
)

const saveBookmarksToStore = (bookmarks: Bookmark[]) => {
    try {
        // @ts-ignore
        window.api.storeSet('humshakals_bookmarks', bookmarks)
    } catch (e) { }
}

const initialState: BookmarksState = {
    list: []
}

const bookmarksSlice = createSlice({
    name: 'bookmarks',
    initialState,
    reducers: {
        toggleBookmark: (state, action: PayloadAction<Bookmark>) => {
            const index = state.list.findIndex(b => b.url === action.payload.url)
            if (index >= 0) {
                state.list.splice(index, 1)
            } else {
                state.list.push(action.payload)
            }
            saveBookmarksToStore(state.list)
        },
        removeBookmark: (state, action: PayloadAction<string>) => {
            state.list = state.list.filter(b => b.url !== action.payload)
            saveBookmarksToStore(state.list)
        }
    },
    extraReducers: (builder) => {
        builder.addCase(loadBookmarksAsync.fulfilled, (state, action) => {
            state.list = action.payload as Bookmark[]
        })
    }
})

export const { toggleBookmark, removeBookmark } = bookmarksSlice.actions

export const selectBookmarks = (state: RootState) => state.bookmarks.list
export const selectIsBookmarked = (url: string) => (state: RootState) => 
    state.bookmarks.list.some(b => b.url === url)

export default bookmarksSlice.reducer
