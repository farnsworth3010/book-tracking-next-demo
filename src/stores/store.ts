import { combineSlices, configureStore } from '@reduxjs/toolkit'
import { uiSlice } from './uiSlice'

const rootReducer = combineSlices(uiSlice)

// A factory so every test gets a fresh store
export const makeStore = () => configureStore({ reducer: rootReducer })

export type RootState = ReturnType<typeof rootReducer>
export type AppDispatch = ReturnType<typeof makeStore>['dispatch']
