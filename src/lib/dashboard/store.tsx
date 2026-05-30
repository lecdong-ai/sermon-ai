'use client'

import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react'
import { Sermon, Theme, Series } from './types'
import { sampleSermons, sampleThemes, sampleSeries } from './data'

interface AppState {
  sermons: Sermon[]
  themes: Theme[]
  series: Series[]
  searchQuery: string
}

type Action =
  | { type: 'ADD_SERMON'; payload: Sermon }
  | { type: 'UPDATE_SERMON'; payload: Sermon }
  | { type: 'DELETE_SERMON'; payload: string }
  | { type: 'ADD_THEME'; payload: Theme }
  | { type: 'UPDATE_THEME'; payload: Theme }
  | { type: 'DELETE_THEME'; payload: string }
  | { type: 'ADD_SERIES'; payload: Series }
  | { type: 'UPDATE_SERIES'; payload: Series }
  | { type: 'DELETE_SERIES'; payload: string }
  | { type: 'SET_SEARCH'; payload: string }

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ADD_SERMON':
      return { ...state, sermons: [...state.sermons, action.payload] }
    case 'UPDATE_SERMON':
      return {
        ...state,
        sermons: state.sermons.map((s) =>
          s.id === action.payload.id ? action.payload : s
        ),
      }
    case 'DELETE_SERMON':
      return {
        ...state,
        sermons: state.sermons.filter((s) => s.id !== action.payload),
      }
    case 'ADD_THEME':
      return { ...state, themes: [...state.themes, action.payload] }
    case 'UPDATE_THEME':
      return {
        ...state,
        themes: state.themes.map((t) =>
          t.id === action.payload.id ? action.payload : t
        ),
      }
    case 'DELETE_THEME':
      return {
        ...state,
        themes: state.themes.filter((t) => t.id !== action.payload),
      }
    case 'ADD_SERIES':
      return { ...state, series: [...state.series, action.payload] }
    case 'UPDATE_SERIES':
      return {
        ...state,
        series: state.series.map((s) =>
          s.id === action.payload.id ? action.payload : s
        ),
      }
    case 'DELETE_SERIES':
      return {
        ...state,
        series: state.series.filter((s) => s.id !== action.payload),
      }
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.payload }
    default:
      return state
  }
}

const initialState: AppState = {
  sermons: sampleSermons,
  themes: sampleThemes,
  series: sampleSeries,
  searchQuery: '',
}

interface AppContextType {
  state: AppState
  dispatch: React.Dispatch<Action>
  getSermon: (id: string) => Sermon | undefined
  getTheme: (id: string) => Theme | undefined
  getSeries: (id: string) => Series | undefined
  getSermonsByTheme: (themeId: string) => Sermon[]
  getSermonsBySeries: (seriesId: string) => Sermon[]
  getSermonsBySeason: (season: string) => Sermon[]
  getSermonsByAudience: (audience: string) => Sermon[]
  getSermonsByPassage: (book: string) => Sermon[]
  getRelatedSermons: (sermonId: string) => Sermon[]
  getThemesByCategory: (category: Theme['category']) => Theme[]
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  const getSermon = useCallback(
    (id: string) => state.sermons.find((s) => s.id === id),
    [state.sermons]
  )

  const getTheme = useCallback(
    (id: string) => state.themes.find((t) => t.id === id),
    [state.themes]
  )

  const getSeries = useCallback(
    (id: string) => state.series.find((s) => s.id === id),
    [state.series]
  )

  const getSermonsByTheme = useCallback(
    (themeId: string) =>
      state.sermons.filter((s) => s.themeIds.includes(themeId)),
    [state.sermons]
  )

  const getSermonsBySeries = useCallback(
    (seriesId: string) =>
      state.sermons.filter((s) => s.seriesId === seriesId),
    [state.sermons]
  )

  const getSermonsBySeason = useCallback(
    (season: string) =>
      state.sermons.filter((s) => s.season === season),
    [state.sermons]
  )

  const getSermonsByAudience = useCallback(
    (audience: string) =>
      state.sermons.filter((s) => s.audience === audience),
    [state.sermons]
  )

  const getSermonsByPassage = useCallback(
    (book: string) =>
      state.sermons.filter((s) => s.bibleBook === book),
    [state.sermons]
  )

  const getRelatedSermons = useCallback(
    (sermonId: string) => {
      const sermon = state.sermons.find((s) => s.id === sermonId)
      if (!sermon) return []
      const relatedIds = sermon.relatedSermonIds
      return state.sermons.filter((s) => relatedIds.includes(s.id))
    },
    [state.sermons]
  )

  const getThemesByCategory = useCallback(
    (category: Theme['category']) =>
      state.themes.filter((t) => t.category === category),
    [state.themes]
  )

  const value = useMemo(
    () => ({
      state,
      dispatch,
      getSermon,
      getTheme,
      getSeries,
      getSermonsByTheme,
      getSermonsBySeries,
      getSermonsBySeason,
      getSermonsByAudience,
      getSermonsByPassage,
      getRelatedSermons,
      getThemesByCategory,
    }),
    [
      state,
      dispatch,
      getSermon,
      getTheme,
      getSeries,
      getSermonsByTheme,
      getSermonsBySeries,
      getSermonsBySeason,
      getSermonsByAudience,
      getSermonsByPassage,
      getRelatedSermons,
      getThemesByCategory,
    ]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
