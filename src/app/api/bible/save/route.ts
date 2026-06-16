import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { book, chapter, verseStart, verseEnd, passage, studyData, memo } = body

    if (!book || !chapter || !passage || !studyData) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('bible_studies')
      .upsert({
        user_id: user.id,
        book,
        chapter,
        verse_start: verseStart,
        verse_end: verseEnd,
        passage,
        study_data: studyData,
        memo,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    console.error('Save bible study error:', err)
    return NextResponse.json({ error: err.message || 'Failed to save' }, { status: 500 })
  }
}
