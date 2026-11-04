import { combineSlices, configureStore } from '@reduxjs/toolkit'
import { useDispatch, useSelector } from 'react-redux'
import { uiSlice } from './uiSlice'

const rootReducer = combineSlices(uiSlice)

// A factory so every test gets a fresh store
export const makeStore = () => configureStore({ reducer: rootReducer })

export const store = makeStore()

export type RootState = ReturnType<typeof rootReducer>
export type AppDispatch = ReturnType<typeof makeStore>['dispatch']

export const useAppSelector = useSelector.withTypes<RootState>()
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
