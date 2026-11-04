import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type BooksView = 'grid' | 'list'

type UiState = { booksView: BooksView }

const initialState: UiState = { booksView: 'grid' }

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Immer lets the reducer "mutate" a draft; RTK turns it into an immutable update
    setBooksView(state, action: PayloadAction<BooksView>) {
      state.booksView = action.payload
    },
  },
  selectors: {
    selectBooksView: (state) => state.booksView,
  },
})

export const { setBooksView } = uiSlice.actions
export const { selectBooksView } = uiSlice.selectors
