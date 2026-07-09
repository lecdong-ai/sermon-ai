#!/usr/bin/env node
/**
 * Vercel church-school 프로젝트 정리 + 새 빌드 트리거
 */
const TOKEN = process.env.VERCEL_TOKEN
const PROJECT_ID = 'prj_bpDO10wPvg1V9G3oDoe8vkZ6Ro6f'
const REPO = { owner: 'anomalyco', repo: 'opencode' } // ← TODO: 실제 repo info
const GIT_REF = 'main'

if (!TOKEN) {
  console.error('❌ VERCEL_TOKEN 없음')
  process.exit(1)
}

const headers = {
  'Authorization': `Bearer ${TOKEN}`,
  'Content-Type': 'application/json',
}

async function api(method, path, body = null) {
  const opts = { method, headers }
  if (body) opts.body = JSON.stringify(body)
  const res = await fetch(`https://api.vercel.com${path}`, opts)
  const text = await res.text()
  let json = null
  try { json = JSON.parse(text) } catch {}
  return { status: res.status, ok: res.ok, json, text: text.slice(0, 500) }
}

function log(label, status, ok, extra = '') {
  console.log(`   ${label.padEnd(50)} ${String(status).padEnd(4)} ${ok ? '✓' : '✗'} ${extra}`)
}

async function main() {
  console.log('━━━ Step 1: Root Directory를 church-school/ 로 변경 ━━━\n')

  const r1 = await api('PATCH', `/v9/projects/${PROJECT_ID}`, {
    rootDirectory: 'church-school/',
  })
  log('PATCH rootDirectory=church-school/', r1.status, r1.ok)
  if (r1.json?.rootDirectory) {
    console.log(`   현재 Root Directory: ${r1.json.rootDirectory}`)
  }
  console.log('')

  console.log('━━━ Step 2: BLOCKED/ERROR 배포 정리 ━━━\n')

  const { json: deps } = await api('GET', `/v6/deployments?projectId=${PROJECT_ID}&limit=20`)
  if (deps?.deployments) {
    for (const d of deps.deployments) {
      if (d.readyState === 'BLOCKED' || d.readyState === 'ERROR' || d.readyState === 'CANCELED') {
        const r = await api('PATCH', `/v13/deployments/${d.id}/cancel`)
        log(`CANCEL ${d.uid || d.id.slice(0, 8)} (${d.readyState})`, r.status, r.ok)
      } else if (d.readyState === 'READY') {
        console.log(`   ${d.uid || d.id.slice(0, 8)} (READY, ${d.url}) - 유지`)
      }
    }
  }
  console.log('')

  console.log('━━━ Step 3: 프로젝트 최종 상태 ━━━\n')
  const { json: proj } = await api(`/v9/projects/${PROJECT_ID}`)
  if (proj) {
    console.log(`   Root Directory: ${proj.rootDirectory || '(없음)'}`)
    console.log(`   Auth (passwordProtection): ${proj.passwordProtection ? 'ON' : 'OFF'}`)
    console.log(`   SSO  (ssoProtection):      ${proj.ssoProtection ? 'ON' : 'OFF'}`)
    console.log(`   Production Deployment: ${proj.targets?.production?.deploymentHostname || '(없음)'}`)
  }
  console.log('')

  console.log('━━━ 완료 ━━━')
  console.log('')
  console.log('다음 단계:')
  console.log('  1. church-school 코드를 살짝 수정 후 git push')
  console.log('     예: church-school/vercel.json 에 코멘트 추가')
  console.log('  2. 또는 Vercel Dashboard → church-school → Deployments → 303bd79 → "Redeploy"')
  console.log('  3. 새 빌드 성공 시 자동 production 으로 promote')
  console.log('  4. 그 후 메인 vercel.json 에 rewrite 추가')
}

main().catch(err => {
  console.error('❌ 오류:', err.message)
  process.exit(1)
})
