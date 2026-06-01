'use client'

import React, { createContext, useContext, useReducer, useCallback, useMemo, useEffect } from 'react'
import { Sermon, Theme, Series } from './types'
import { sampleSermons, sampleThemes, sampleSeries } from './data'
import { SERMON_TYPES, AUDIENCES } from './constants'

const LS_KEY = 'sermon-options'
const LS_SERMONS_KEY = 'sermon-data'

function loadOptions() {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return null
}

function saveOptions(data: { sermonTypes: string[]; audiences: string[]; preachers: string[] }) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(data))
  } catch {}
}

function loadSermons(): Sermon[] | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(LS_SERMONS_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return null
}

function saveSermons(sermons: Sermon[]) {
  try {
    localStorage.setItem(LS_SERMONS_KEY, JSON.stringify(sermons))
  } catch {}
}

interface AppState {
  sermons: Sermon[]
  themes: Theme[]
  series: Series[]
  searchQuery: string
  sermonTypes: string[]
  audiences: string[]
  preachers: string[]
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
  | { type: 'ADD_SERMON_TYPE'; payload: string }
  | { type: 'DELETE_SERMON_TYPE'; payload: string }
  | { type: 'ADD_AUDIENCE'; payload: string }
  | { type: 'DELETE_AUDIENCE'; payload: string }
  | { type: 'ADD_PREACHER'; payload: string }
  | { type: 'DELETE_PREACHER'; payload: string }
  | { type: 'SET_OPTIONS'; payload: { sermonTypes: string[]; audiences: string[]; preachers: string[] } }

function appReducer(state: AppState, action: Action): AppState {
  let next: AppState
  switch (action.type) {
    case 'ADD_SERMON':
      next = { ...state, sermons: [...state.sermons, action.payload] }; saveSermons(next.sermons); break
    case 'UPDATE_SERMON':
      next = { ...state, sermons: state.sermons.map((s) =>
        s.id === action.payload.id ? action.payload : s
      )}; saveSermons(next.sermons); break
    case 'DELETE_SERMON':
      next = { ...state, sermons: state.sermons.filter((s) => s.id !== action.payload) }; saveSermons(next.sermons); break
    case 'ADD_THEME':
      next = { ...state, themes: [...state.themes, action.payload] }; break
    case 'UPDATE_THEME':
      next = { ...state, themes: state.themes.map((t) =>
        t.id === action.payload.id ? action.payload : t
      )}; break
    case 'DELETE_THEME':
      next = { ...state, themes: state.themes.filter((t) => t.id !== action.payload) }; break
    case 'ADD_SERIES':
      next = { ...state, series: [...state.series, action.payload] }; break
    case 'UPDATE_SERIES':
      next = { ...state, series: state.series.map((s) =>
        s.id === action.payload.id ? action.payload : s
      )}; break
    case 'DELETE_SERIES':
      next = { ...state, series: state.series.filter((s) => s.id !== action.payload) }; break
    case 'SET_SEARCH':
      next = { ...state, searchQuery: action.payload }; break
    case 'ADD_SERMON_TYPE':
      if (state.sermonTypes.includes(action.payload)) return state
      next = { ...state, sermonTypes: [...state.sermonTypes, action.payload] }; break
    case 'DELETE_SERMON_TYPE':
      next = { ...state, sermonTypes: state.sermonTypes.filter((t) => t !== action.payload) }; break
    case 'ADD_AUDIENCE':
      if (state.audiences.includes(action.payload)) return state
      next = { ...state, audiences: [...state.audiences, action.payload] }; break
    case 'DELETE_AUDIENCE':
      next = { ...state, audiences: state.audiences.filter((a) => a !== action.payload) }; break
    case 'ADD_PREACHER':
      if (state.preachers.includes(action.payload)) return state
      next = { ...state, preachers: [...state.preachers, action.payload] }; break
    case 'DELETE_PREACHER':
      next = { ...state, preachers: state.preachers.filter((p) => p !== action.payload) }; break
    case 'SET_OPTIONS':
      next = { ...state, ...action.payload }; break
    default:
      return state
  }
  saveOptions({
    sermonTypes: next.sermonTypes,
    audiences: next.audiences,
    preachers: next.preachers,
  })
  return next
}

function getInitialState(): AppState {
  const savedSermons = loadSermons()
  return {
    sermons: savedSermons || sampleSermons,
    themes: sampleThemes,
    series: sampleSeries,
    searchQuery: '',
    sermonTypes: [...SERMON_TYPES],
    audiences: [...AUDIENCES],
    preachers: ['김은혜 목사'],
  }
}

const initialAppState = getInitialState()

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
  const [state, dispatch] = useReducer(appReducer, initialAppState)

  useEffect(() => {
    const saved = loadOptions()
    if (saved) {
      dispatch({ type: 'SET_OPTIONS', payload: saved })
    }
  }, [])

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
