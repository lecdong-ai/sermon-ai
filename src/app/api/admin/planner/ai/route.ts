import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Server OPENAI_API_KEY is not set' }, { status: 500 })
    }

    const body = await req.json()
    const { messages, model = 'gpt-4o-mini', temperature = 0.7, response_format } = body

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'messages array is required' }, { status: 400 })
    }

    const payload: Record<string, any> = {
      model,
      messages,
      temperature,
    }

    if (response_format) {
      payload.response_format = response_format
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('OpenAI proxy error:', data)
      return NextResponse.json({ error: data?.error?.message || 'OpenAI API call failed' }, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Admin planner AI route error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
