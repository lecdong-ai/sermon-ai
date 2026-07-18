import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://otzdebgfztoattfuvxqy.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90emRlYmdmenRvYXR0ZnV2eHF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1NjQ4OTEsImV4cCI6MjA5ODE0MDg5MX0.gaKaptRI7McwMdJMfJ0qn1RNRExmJwqTvGeW4ImlFb8'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
