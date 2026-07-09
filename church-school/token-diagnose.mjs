#!/usr/bin/env node
/**
 * Vercel 토큰 진단 스크립트
 */
const TOKEN = process.env.VERCEL_TOKEN

if (!TOKEN) {
  console.error('❌ VERCEL_TOKEN 환경변수가 설정되지 않았습니다.')
  process.exit(1)
}

console.log('━━━ 토큰 진단 ━━━\n')

console.log('▶ 토큰 정보:')
console.log(`   길이: ${TOKEN.length} 자`)
console.log(`   시작: "${TOKEN.slice(0, 8)}"`)
console.log(`   끝:   "${TOKEN.slice(-8)}"`)
console.log(`   전체: "${TOKEN}"`)
console.log(`   공백/특수문자 포함: ${/[<>\s]/.test(TOKEN) ? '⚠️ YES (문제!)' : '✓ NO'}`)
console.log('')

const headers = {
  'Authorization': `Bearer ${TOKEN}`,
  'Content-Type': 'application/json',
}

async function api(method, path, body = null) {
  const opts = { method, headers }
  if (body) opts.body = JSON.stringify(body)
  const url = `https://api.vercel.com${path}`
  try {
    const res = await fetch(url, opts)
    const text = await res.text()
    let json = null
    try { json = JSON.parse(text) } catch {}
    return { status: res.status, ok: res.ok, json, text: text.slice(0, 300) }
  } catch (err) {
    return { status: 0, ok: false, json: null, text: err.message }
  }
}

console.log('▶ TEST 1: /v9/projects (현재 사용자에 접근 가능한 프로젝트 목록)')
const r1 = await api('GET', '/v9/projects?limit=5')
console.log(`   HTTP: ${r1.status}`)
console.log(`   Body: ${r1.text}`)
console.log('')

console.log('▶ TEST 2: /v9/projects/prj_bpDO10wPvg1V9G3oDoe8vkZ6Ro6f (church-school)')
const r2 = await api('GET', '/v9/projects/prj_bpDO10wPvg1V9G3oDoe8vkZ6Ro6f')
console.log(`   HTTP: ${r2.status}`)
console.log(`   Body: ${r2.text}`)
console.log('')

console.log('▶ TEST 3: /v9/user (현재 사용자 정보)')
const r3 = await api('GET', '/v9/user')
console.log(`   HTTP: ${r3.status}`)
console.log(`   Body: ${r3.text}`)
console.log('')

console.log('▶ TEST 4: /v1/projects (구버전 API)')
const r4 = await api('GET', '/v1/projects?limit=1')
console.log(`   HTTP: ${r4.status}`)
console.log(`   Body: ${r4.text.slice(0, 200)}`)
console.log('')

console.log('━━━ 완료 ━━━')
