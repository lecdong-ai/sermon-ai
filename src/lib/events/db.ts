import { supabase } from '@/lib/supabase'
import type { Event, Registration, EventGroup, EventTeam, EventVehicle, EventNotice, EventStats, EventStatus, RegistrationStatus, PaymentStatus } from '@/types/event'
import { mockEvents, mockRegistrations, mockGroups, mockTeams, mockVehicles, mockNotices, generateId } from '@/data/events/mock-data'

const STORAGE_KEYS = {
  events: 'ev_events',
  registrations: 'ev_registrations',
  groups: 'ev_groups',
  teams: 'ev_teams',
  vehicles: 'ev_vehicles',
  notices: 'ev_notices',
}

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const data = localStorage.getItem(key)
    if (data) return JSON.parse(data)
  } catch {}
  return fallback
}

function saveToStorage<T>(key: string, data: T) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch {}
}

function getEventUserId(): string {
  if (typeof window === 'undefined') return 'anonymous'
  try {
    const stored = localStorage.getItem('ev_current_user_id')
    if (stored) return stored
    const id = 'user_' + generateId()
    localStorage.setItem('ev_current_user_id', id)
    return id
  } catch {
    return 'anonymous'
  }
}

export function setEventUserId(userId: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('ev_current_user_id', userId)
  }
}

export async function getEvents(): Promise<Event[]> {
  const local = loadFromStorage<Event[]>(STORAGE_KEYS.events, mockEvents)
  return local.filter(e => e.status !== 'draft')
}

export async function getAdminEvents(): Promise<Event[]> {
  return loadFromStorage<Event[]>(STORAGE_KEYS.events, mockEvents)
}

export async function getEventById(id: string): Promise<Event | null> {
  const events = loadFromStorage<Event[]>(STORAGE_KEYS.events, mockEvents)
  return events.find(e => e.id === id) || null
}

export async function createEvent(data: Omit<Event, 'id' | 'createdAt'>): Promise<Event> {
  const events = loadFromStorage<Event[]>(STORAGE_KEYS.events, mockEvents)
  const event: Event = {
    ...data,
    id: generateId(),
    createdAt: new Date().toISOString().split('T')[0],
  }
  events.push(event)
  saveToStorage(STORAGE_KEYS.events, events)
  return event
}

export async function updateEvent(id: string, data: Partial<Event>): Promise<Event | null> {
  const events = loadFromStorage<Event[]>(STORAGE_KEYS.events, mockEvents)
  const idx = events.findIndex(e => e.id === id)
  if (idx === -1) return null
  events[idx] = { ...events[idx], ...data }
  saveToStorage(STORAGE_KEYS.events, events)
  return events[idx]
}

export async function deleteEvent(id: string): Promise<boolean> {
  const events = loadFromStorage<Event[]>(STORAGE_KEYS.events, mockEvents)
  const filtered = events.filter(e => e.id !== id)
  if (filtered.length === events.length) return false
  saveToStorage(STORAGE_KEYS.events, filtered)
  return true
}

export async function getRegistrations(eventId: string): Promise<Registration[]> {
  const all = loadFromStorage<Registration[]>(STORAGE_KEYS.registrations, mockRegistrations)
  return all.filter(r => r.eventId === eventId)
}

export async function getRegistrationById(id: string): Promise<Registration | null> {
  const all = loadFromStorage<Registration[]>(STORAGE_KEYS.registrations, mockRegistrations)
  return all.find(r => r.id === id) || null
}

export async function getUserRegistrations(userId: string): Promise<Registration[]> {
  const all = loadFromStorage<Registration[]>(STORAGE_KEYS.registrations, mockRegistrations)
  return all.filter(r => r.userId === userId)
}

export async function getMyRegistrations(): Promise<Registration[]> {
  const userId = getEventUserId()
  const all = loadFromStorage<Registration[]>(STORAGE_KEYS.registrations, mockRegistrations)
  return all.filter(r => r.userId === userId)
}

export async function createRegistration(data: Omit<Registration, 'id' | 'createdAt' | 'updatedAt'>): Promise<Registration> {
  const all = loadFromStorage<Registration[]>(STORAGE_KEYS.registrations, mockRegistrations)
  const now = new Date().toISOString()
  const reg: Registration = {
    ...data,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  }
  all.push(reg)
  saveToStorage(STORAGE_KEYS.registrations, all)
  return reg
}

export async function updateRegistration(id: string, data: Partial<Registration>): Promise<Registration | null> {
  const all = loadFromStorage<Registration[]>(STORAGE_KEYS.registrations, mockRegistrations)
  const idx = all.findIndex(r => r.id === id)
  if (idx === -1) return null
  all[idx] = { ...all[idx], ...data, updatedAt: new Date().toISOString() }
  saveToStorage(STORAGE_KEYS.registrations, all)
  return all[idx]
}

export async function deleteRegistration(id: string): Promise<boolean> {
  const all = loadFromStorage<Registration[]>(STORAGE_KEYS.registrations, mockRegistrations)
  const filtered = all.filter(r => r.id !== id)
  if (filtered.length === all.length) return false
  saveToStorage(STORAGE_KEYS.registrations, filtered)
  return true
}

export async function getEventStats(eventId: string): Promise<EventStats> {
  const registrations = await getRegistrations(eventId)
  const groups = await getGroups(eventId)
  return {
    totalRegistrations: registrations.length,
    confirmedCount: registrations.filter(r => r.status === 'confirmed').length,
    pendingPaymentCount: registrations.filter(r => r.paymentStatus === 'pending').length,
    checkInCount: registrations.filter(r => r.checkInAt !== null).length,
    cancelledCount: registrations.filter(r => r.status === 'cancelled').length,
    groupStats: groups.map(g => ({
      groupId: g.id,
      groupName: g.name,
      count: registrations.filter(r => r.groupId === g.id).length,
    })),
  }
}

export async function getGroups(eventId: string): Promise<EventGroup[]> {
  const all = loadFromStorage<Record<string, EventGroup[]>>(STORAGE_KEYS.groups, mockGroups)
  return all[eventId] || []
}

export async function saveGroup(eventId: string, group: Omit<EventGroup, 'id'>): Promise<EventGroup> {
  const all = loadFromStorage<Record<string, EventGroup[]>>(STORAGE_KEYS.groups, mockGroups)
  if (!all[eventId]) all[eventId] = []
  const newGroup: EventGroup = { ...group, id: generateId() }
  all[eventId].push(newGroup)
  saveToStorage(STORAGE_KEYS.groups, all)
  return newGroup
}

export async function updateGroup(eventId: string, groupId: string, data: Partial<EventGroup>): Promise<EventGroup | null> {
  const all = loadFromStorage<Record<string, EventGroup[]>>(STORAGE_KEYS.groups, mockGroups)
  const groups = all[eventId]
  if (!groups) return null
  const idx = groups.findIndex(g => g.id === groupId)
  if (idx === -1) return null
  groups[idx] = { ...groups[idx], ...data }
  saveToStorage(STORAGE_KEYS.groups, all)
  return groups[idx]
}

export async function deleteGroup(eventId: string, groupId: string): Promise<boolean> {
  const all = loadFromStorage<Record<string, EventGroup[]>>(STORAGE_KEYS.groups, mockGroups)
  const groups = all[eventId]
  if (!groups) return false
  all[eventId] = groups.filter(g => g.id !== groupId)
  saveToStorage(STORAGE_KEYS.groups, all)
  return true
}

export async function getTeams(groupId: string): Promise<EventTeam[]> {
  const all = loadFromStorage<Record<string, EventTeam[]>>(STORAGE_KEYS.teams, mockTeams)
  return all[groupId] || []
}

export async function saveTeam(groupId: string, team: Omit<EventTeam, 'id'>): Promise<EventTeam> {
  const all = loadFromStorage<Record<string, EventTeam[]>>(STORAGE_KEYS.teams, mockTeams)
  if (!all[groupId]) all[groupId] = []
  const newTeam: EventTeam = { ...team, id: generateId() }
  all[groupId].push(newTeam)
  saveToStorage(STORAGE_KEYS.teams, all)
  return newTeam
}

export async function deleteTeam(groupId: string, teamId: string): Promise<boolean> {
  const all = loadFromStorage<Record<string, EventTeam[]>>(STORAGE_KEYS.teams, mockTeams)
  const teams = all[groupId]
  if (!teams) return false
  all[groupId] = teams.filter(t => t.id !== teamId)
  saveToStorage(STORAGE_KEYS.teams, all)
  return true
}

export async function getVehicles(eventId: string): Promise<EventVehicle[]> {
  const all = loadFromStorage<Record<string, EventVehicle[]>>(STORAGE_KEYS.vehicles, mockVehicles)
  return all[eventId] || []
}

export async function saveVehicle(eventId: string, vehicle: Omit<EventVehicle, 'id'>): Promise<EventVehicle> {
  const all = loadFromStorage<Record<string, EventVehicle[]>>(STORAGE_KEYS.vehicles, mockVehicles)
  if (!all[eventId]) all[eventId] = []
  const newVehicle: EventVehicle = { ...vehicle, id: generateId() }
  all[eventId].push(newVehicle)
  saveToStorage(STORAGE_KEYS.vehicles, all)
  return newVehicle
}

export async function updateVehicle(eventId: string, vehicleId: string, data: Partial<EventVehicle>): Promise<EventVehicle | null> {
  const all = loadFromStorage<Record<string, EventVehicle[]>>(STORAGE_KEYS.vehicles, mockVehicles)
  const vehicles = all[eventId]
  if (!vehicles) return null
  const idx = vehicles.findIndex(v => v.id === vehicleId)
  if (idx === -1) return null
  vehicles[idx] = { ...vehicles[idx], ...data }
  saveToStorage(STORAGE_KEYS.vehicles, all)
  return vehicles[idx]
}

export async function deleteVehicle(eventId: string, vehicleId: string): Promise<boolean> {
  const all = loadFromStorage<Record<string, EventVehicle[]>>(STORAGE_KEYS.vehicles, mockVehicles)
  const vehicles = all[eventId]
  if (!vehicles) return false
  all[eventId] = vehicles.filter(v => v.id !== vehicleId)
  saveToStorage(STORAGE_KEYS.vehicles, all)
  return true
}

export async function getNotices(eventId: string): Promise<EventNotice[]> {
  const all = loadFromStorage<EventNotice[]>(STORAGE_KEYS.notices, mockNotices)
  return all.filter(n => n.eventId === eventId)
}

export async function createNotice(data: Omit<EventNotice, 'id' | 'sentAt'>): Promise<EventNotice> {
  const all = loadFromStorage<EventNotice[]>(STORAGE_KEYS.notices, mockNotices)
  const notice: EventNotice = {
    ...data,
    id: generateId(),
    sentAt: new Date().toISOString(),
  }
  all.push(notice)
  saveToStorage(STORAGE_KEYS.notices, all)
  return notice
}

export async function deleteNotice(id: string): Promise<boolean> {
  const all = loadFromStorage<EventNotice[]>(STORAGE_KEYS.notices, mockNotices)
  const filtered = all.filter(n => n.id !== id)
  if (filtered.length === all.length) return false
  saveToStorage(STORAGE_KEYS.notices, filtered)
  return true
}
