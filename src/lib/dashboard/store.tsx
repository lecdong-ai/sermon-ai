'use client'

import React, { createContext, useContext, useReducer, useCallback, useMemo, useEffect, useState } from 'react'
import { Sermon, Theme, Series } from './types'
import { sampleThemes, sampleSeries } from './data'
import { SERMON_TYPES, AUDIENCES, SEASONS } from './constants'

const LS_KEY = 'sermon-options'

function loadOptions() {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return null
}

function saveOptions(data: { sermonTypes: string[]; audiences: string[]; preachers: string[]; seasons: string[]; seminars: string[] }) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(data))
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
  seasons: string[]
  seminars: string[]
  loading: boolean
}

type Action =
  | { type: 'SET_SERMONS'; payload: Sermon[] }
  | { type: 'ADD_SERMON'; payload: Sermon }
  | { type: 'UPDATE_SERMON'; payload: Sermon }
  | { type: 'DELETE_SERMON'; payload: string }
  | { type: 'ADD_THEME'; payload: Theme }
  | { type: 'UPDATE_THEME'; payload: Theme }
  | { type: 'DELETE_THEME'; payload: string }
  | { type: 'ADD_SERIES'; payload: Series }
  | { type: 'UPDATE_SERIES'; payload: Series }
  | { type: 'DELETE_SERIES'; payload: string }
  | { type: 'SET_SERIES'; payload: Series[] }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'ADD_SERMON_TYPE'; payload: string }
  | { type: 'DELETE_SERMON_TYPE'; payload: string }
  | { type: 'ADD_AUDIENCE'; payload: string }
  | { type: 'DELETE_AUDIENCE'; payload: string }
  | { type: 'ADD_PREACHER'; payload: string }
  | { type: 'DELETE_PREACHER'; payload: string }
  | { type: 'ADD_SEASON'; payload: string }
  | { type: 'DELETE_SEASON'; payload: string }
  | { type: 'UPDATE_SEASON'; payload: { old: string; new: string } }
  | { type: 'ADD_SEMINAR'; payload: string }
  | { type: 'DELETE_SEMINAR'; payload: string }
  | { type: 'UPDATE_SEMINAR'; payload: { old: string; new: string } }
  | { type: 'SET_OPTIONS'; payload: { sermonTypes: string[]; audiences: string[]; preachers: string[]; seasons: string[] } }
  | { type: 'SET_LOADING'; payload: boolean }

function appReducer(state: AppState, action: Action): AppState {
  let next: AppState
  switch (action.type) {
    case 'SET_SERMONS':
      next = { ...state, sermons: action.payload }; break
    case 'ADD_SERMON':
      next = { ...state, sermons: [...state.sermons, action.payload] }; break
    case 'UPDATE_SERMON':
      next = { ...state, sermons: state.sermons.map((s) =>
        s.id === action.payload.id ? action.payload : s
      )}; break
    case 'DELETE_SERMON':
      next = { ...state, sermons: state.sermons.filter((s) => s.id !== action.payload) }; break
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
    case 'SET_SERIES':
      next = { ...state, series: action.payload }; break
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
    case 'ADD_SEASON':
      if (state.seasons.includes(action.payload)) return state
      next = { ...state, seasons: [...state.seasons, action.payload] }; break
    case 'DELETE_SEASON':
      next = { ...state, seasons: state.seasons.filter((s) => s !== action.payload) }; break
    case 'UPDATE_SEASON':
      next = { ...state, seasons: state.seasons.map((s) => s === action.payload.old ? action.payload.new : s) }; break
    case 'ADD_SEMINAR':
      if (state.seminars.includes(action.payload)) return state
      next = { ...state, seminars: [...state.seminars, action.payload] }; break
    case 'DELETE_SEMINAR':
      next = { ...state, seminars: state.seminars.filter((s) => s !== action.payload) }; break
    case 'UPDATE_SEMINAR':
      next = { ...state, seminars: state.seminars.map((s) => s === action.payload.old ? action.payload.new : s) }; break
    case 'SET_OPTIONS':
      next = { ...state, ...action.payload }; break
    case 'SET_LOADING':
      next = { ...state, loading: action.payload }; break
    default:
      return state
  }
  saveOptions({
    sermonTypes: next.sermonTypes,
    audiences: next.audiences,
    preachers: next.preachers,
    seasons: next.seasons,
    seminars: next.seminars,
  })
  return next
}

function getInitialState(): AppState {
  return {
    sermons: [],
    themes: sampleThemes,
    series: sampleSeries,
    searchQuery: '',
    sermonTypes: [...SERMON_TYPES],
    audiences: [...AUDIENCES],
    preachers: ['김은혜 목사'],
    seasons: [...SEASONS],
    seminars: [],
    loading: true,
  }
}

const initialAppState = getInitialState()

interface AppContextType {
  state: AppState
  dispatch: React.Dispatch<Action>
  loadSermons: () => Promise<void>
  createSermon: (sermon: Omit<Sermon, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Sermon | null>
  updateSermon: (sermon: Sermon) => Promise<Sermon | null>
  deleteSermon: (id: string) => Promise<boolean>
  deleteSeries: (id: string) => Promise<boolean>
  createSeries: (name: string, description?: string) => Promise<Series | null>
  updateSeries: (id: string, name: string) => Promise<boolean>
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

  const loadSermons = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const res = await fetch('/api/sermons')
      const data = await res.json()
      if (data.success) {
        dispatch({ type: 'SET_SERMONS', payload: data.data })
      }
    } catch (err) {
      console.error('Failed to load sermons:', err)
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  const loadSeries = useCallback(async () => {
    try {
      const res = await fetch('/api/series')
      const data = await res.json()
      if (data.success) {
        dispatch({ type: 'SET_SERIES', payload: data.data })
      }
    } catch (err) {
      console.error('Failed to load series:', err)
    }
  }, [])

  const createSermon = useCallback(async (sermon: Omit<Sermon, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const res = await fetch('/api/sermons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sermon),
      })
      const data = await res.json()
      if (data.success) {
        dispatch({ type: 'ADD_SERMON', payload: data.data })
        return data.data
      }
    } catch (err) {
      console.error('Failed to create sermon:', err)
    }
    return null
  }, [])

  const updateSermon = useCallback(async (sermon: Sermon) => {
    try {
      const res = await fetch(`/api/sermons/${sermon.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sermon),
      })
      const data = await res.json()
      if (data.success) {
        dispatch({ type: 'UPDATE_SERMON', payload: data.data || sermon })
        return data.data || sermon
      }
    } catch (err) {
      console.error('Failed to update sermon:', err)
    }
    return null
  }, [])

  const deleteSermon = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/sermons/${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success) {
        dispatch({ type: 'DELETE_SERMON', payload: id })
        return true
      }
    } catch (err) {
      console.error('Failed to delete sermon:', err)
    }
    return false
  }, [])

  const deleteSeries = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/series/${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success) {
        dispatch({ type: 'DELETE_SERIES', payload: id })
        return true
      }
    } catch (err) {
      console.error('Failed to delete series:', err)
    }
    return false
  }, [])

  const createSeries = useCallback(async (name: string, description?: string) => {
    try {
      const res = await fetch('/api/series', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      })
      const data = await res.json()
      if (data.success) {
        dispatch({ type: 'ADD_SERIES', payload: data.data })
        return data.data
      }
    } catch (err) {
      console.error('Failed to create series:', err)
    }
    return null
  }, [])

  const updateSeries = useCallback(async (id: string, name: string) => {
    try {
      const res = await fetch(`/api/series/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      const data = await res.json()
      if (data.success) {
        dispatch({ type: 'UPDATE_SERIES', payload: { ...state.series.find(s => s.id === id)!, name } })
        return true
      }
    } catch (err) {
      console.error('Failed to update series:', err)
    }
    return false
  }, [state.series])

  useEffect(() => {
    loadSermons()
    loadSeries()
  }, [loadSermons, loadSeries])

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
      loadSermons,
      createSermon,
      updateSermon,
      deleteSermon,
      deleteSeries,
      createSeries,
      updateSeries,
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
      loadSermons,
      createSermon,
      updateSermon,
      deleteSermon,
      deleteSeries,
      createSeries,
      updateSeries,
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
