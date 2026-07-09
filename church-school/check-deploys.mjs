#!/usr/bin/env node
/**
 * Vercel church-school 배포 목록 확인
 */
const TOKEN = process.env.VERCEL_TOKEN
const PROJECT_ID = 'prj_bpDO10wPvg1V9G3oDoe8vkZ6Ro6f'

if (!TOKEN) {
  console.error('❌ VERCEL_TOKEN 없음')
  process.exit(1)
}

const headers = {
  'Authorization': `Bearer ${TOKEN}`,
  'Content-Type': 'application/json',
}

async function api(path) {
  const res = await fetch(`https://api.vercel.com${path}`, { headers })
  const text = await res.text()
  let json = null
  try { json = JSON.parse(text) } catch {}
  return { status: res.status, json }
}

console.log('▶ church-school 프로젝트의 최근 배포 10개:')
const { json } = await api(`/v6/deployments?projectId=${PROJECT_ID}&limit=10`)
if (json?.deployments) {
  for (const d of json.deployments) {
    const url = d.url || '?'
    const target = d.target || 'production'
    const state = d.state || d.readyState || '?'
    const created = new Date(d.createdAt).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })
    const meta = d.meta?.githubCommitMessage?.split('\n')[0] || d.meta?.githubCommitSha?.slice(0, 7) || ''
    console.log(`   ${state.padEnd(8)} ${target.padEnd(11)} ${url.padEnd(70)} ${created}`)
    if (meta) console.log(`            └─ ${meta}`)
  }
}

console.log('\n▶ 현재 production deployment:')
const { json: proj } = await api(`/v9/projects/${PROJECT_ID}`)
if (proj) {
  console.log(`   productionDeployment: ${JSON.stringify(proj.productionDeployment, null, 2)}`)
  console.log(`   targets: ${JSON.stringify(proj.targets, null, 2)}`)
  console.log(`   alias: ${proj.alias?.join(', ')}`)
}
