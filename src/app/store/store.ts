import { combineSlices, configureStore } from '@reduxjs/toolkit'
import { uiSlice } from '@/features/toggle-books-view'

// The app layer may import slices from any layer below; lower layers never see the store itself
const rootReducer = combineSlices(uiSlice)

// A factory so every test gets a fresh store
export const makeStore = () => configureStore({ reducer: rootReducer })
