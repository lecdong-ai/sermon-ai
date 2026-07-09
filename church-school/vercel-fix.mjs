#!/usr/bin/env node
/**
 * Vercel church-school 프로젝트 설정 수정 스크립트
 *
 * 사용법:
 * 1. https://vercel.com/account/tokens 에서 Personal Access Token 생성
 *    - Name: fix-script
 *    - Scope: Full Access
 * 2. export VERCEL_TOKEN="<생성한_토큰>"
 * 3. node vercel-fix.mjs
 */

const PROJECT_ID = 'prj_bpDO10wPvg1V9G3oDoe8vkZ6Ro6f'
const PROJECT_NAME = 'church-school'
const DEFAULT_DOMAIN = `${PROJECT_NAME}.vercel.app`
const TOKEN = process.env.VERCEL_TOKEN

if (!TOKEN) {
  console.error('❌ VERCEL_TOKEN 환경변수가 설정되지 않았습니다.')
  console.error('   1. https://vercel.com/account/tokens 접속')
  console.error('   2. "Create Token" 클릭 → Full Access')
  console.error('   3. export VERCEL_TOKEN="<생성한_토큰>"')
  process.exit(1)
}

const headers = {
  'Authorization': `Bearer ${TOKEN}`,
  'Content-Type': 'application/json',
}

async function api(method, path, body = null) {
  const opts = { method, headers }
  if (body) opts.body = JSON.stringify(body)
  const url = `https://api.vercel.com${path}`
  const res = await fetch(url, opts)
  const text = await res.text()
  let json = null
  try { json = JSON.parse(text) } catch {}
  return { status: res.status, ok: res.ok, json, text }
}

function log(label, status, ok, extra = '') {
  const mark = ok ? '✓' : '✗'
  console.log(`   ${label.padEnd(50)} ${String(status).padEnd(4)} ${mark} ${extra}`)
}

async function main() {
  console.log('━━━ Vercel church-school 설정 수정 ━━━\n')

  console.log('▶ 1. 프로젝트 정보 가져오기...')
  const { status: ps, json: project } = await api('GET', `/v9/projects/${PROJECT_ID}`)
  if (!project || !project.id) {
    log('GET project', ps, false, project?.error?.message || 'invalid response')
    console.error('❌ 프로젝트 정보를 가져올 수 없습니다. 토큰을 확인하세요.')
    process.exit(1)
  }
  console.log(`   ✓ 프로젝트: ${project.name}`)
  console.log(`     ID:        ${project.id}`)
  console.log(`     Framework: ${project.framework || 'nextjs'}`)
  console.log(`     Root Dir:  ${project.rootDirectory || '(없음)'}`)
  console.log(`     Auth:      ${project.passwordProtection ? 'ON' : 'OFF'}`)
  console.log(`     SSO:       ${project.ssoProtection ? 'ON' : 'OFF'}`)
  console.log('')

  console.log('▶ 2. Vercel Authentication 비활성화...')
  // Try various field combinations
  const attempts = [
    { passwordProtection: null },
    { ssoProtection: null },
    { passwordProtection: undefined },
    { protectionBypass: null },
  ]
  let authDisabled = false
  for (const body of attempts) {
    const r = await api('PATCH', `/v9/projects/${PROJECT_ID}`, body)
    const label = `PATCH ${JSON.stringify(body)}`
    log(label, r.status, r.ok)
    if (r.ok) authDisabled = true
  }
  console.log('')

  console.log('▶ 3. 현재 도메인 확인...')
  const { json: domains } = await api('GET', `/v9/projects/${PROJECT_ID}/domains`)
  const domainList = domains?.domains || []
  for (const d of domainList) {
    console.log(`   - ${d.name} (${d.verified ? 'verified' : 'NOT verified'})`)
  }
  const hasDefault = domainList.find(d => d.name === DEFAULT_DOMAIN)
  console.log(`   기본 도메인 (${DEFAULT_DOMAIN}): ${hasDefault ? '✓ 등록됨' : '✗ 없음'}`)
  console.log('')

  console.log(`▶ 4. 기본 도메인 등록 시도: ${DEFAULT_DOMAIN}...`)
  if (!hasDefault) {
    const r = await api('POST', `/v9/projects/${PROJECT_ID}/domains`, {
      name: DEFAULT_DOMAIN,
    })
    log('POST domain', r.status, r.ok)
    if (r.json?.error) console.log(`     에러: ${r.json.error.message}`)
  } else {
    console.log('   (이미 등록됨)')
  }
  console.log('')

  console.log('▶ 5. 도메인 다시 확인...')
  const { json: domains2 } = await api('GET', `/v9/projects/${PROJECT_ID}/domains`)
  const domainList2 = domains2?.domains || []
  for (const d of domainList2) {
    console.log(`   - ${d.name} (${d.verified ? 'verified' : 'NOT verified'})`)
  }
  console.log('')

  console.log('▶ 6. Vercel Authentication 끄기 (재시도)...')
  // Use DELETE /v9/projects/{id}/protection if available
  const tryDel = await api('DELETE', `/v9/projects/${PROJECT_ID}/protection`)
  log('DELETE /protection', tryDel.status, tryDel.ok)
  const tryDel2 = await api('DELETE', `/v1/projects/${PROJECT_ID}/protection-bypass`)
  log('DELETE /protection-bypass', tryDel2.status, tryDel2.ok)
  console.log('')

  console.log('▶ 7. 프로젝트 최종 상태...')
  const { json: final } = await api('GET', `/v9/projects/${PROJECT_ID}`)
  if (final) {
    console.log(`   Auth (passwordProtection): ${final.passwordProtection ? 'ON' : 'OFF'}`)
    console.log(`   SSO  (ssoProtection):      ${final.ssoProtection ? 'ON' : 'OFF'}`)
  }
  console.log('')

  console.log('━━━ 완료 ━━━')
  console.log('')
  console.log('다음 단계:')
  console.log(`  1. https://${DEFAULT_DOMAIN} 접속해서 church-school 페이지가 뜨는지 확인`)
  console.log('  2. Vercel Authentication 이 여전히 켜져있으면 Dashboard 에서 수동으로 끄기')
  console.log('  3. 정상 작동하면 메인 프로젝트 vercel.json 에 rewrite 추가')
  console.log('')
}

main().catch(err => {
  console.error('❌ 오류:', err.message)
  process.exit(1)
})
