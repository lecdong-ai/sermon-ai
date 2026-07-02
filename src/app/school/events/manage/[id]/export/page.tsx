'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Download, Printer, FileSpreadsheet, FileText, Users, Phone, Truck, AlertTriangle } from 'lucide-react'
import { getRegistrations, getEventById, getGroups, getTeams, getVehicles } from '@/lib/events/db'
import type { Registration, Event, EventGroup, EventTeam, EventVehicle } from '@/types/event'

export default function ExportPage() {
  const { id } = useParams<{ id: string }>()
  const [event, setEvent] = useState<Event | null>(null)
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [groups, setGroups] = useState<EventGroup[]>([])
  const [teams, setTeams] = useState<EventTeam[]>([])
  const [vehicles, setVehicles] = useState<EventVehicle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getEventById(id), getRegistrations(id), getGroups(id), getVehicles(id)]).then(([ev, regs, grps, vehs]) => {
      setEvent(ev)
      setRegistrations(regs)
      setGroups(grps)
      setVehicles(vehs)
      const allTeams: EventTeam[] = []
      Promise.all(grps.map(g => getTeams(g.id).then(ts => allTeams.push(...ts)))).then(() => {
        setTeams(allTeams)
        setLoading(false)
      })
    })
  }, [id])

  const getGroupName = (gid: string | null) => groups.find(g => g.id === gid)?.name || '-'
  const getTeamName = (tid: string | null) => teams.find(t => t.id === tid)?.name || '-'
  const getVehicleName = (vid: string | null) => vehicles.find(v => v.id === vid)?.name || '-'

  const confirmed = registrations.filter(r => r.status !== 'cancelled')

  const generateCSV = (rows: string[][]) => {
    const bom = '\uFEFF'
    const csv = rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n')
    return bom + csv
  }

  const downloadCSV = (filename: string, rows: string[][]) => {
    const blob = new Blob([generateCSV(rows)], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportAll = () => {
    const rows = [
      ['이름', '학년/부서', '성별', '생년월일', '보호자명', '보호자연락처', '비상연락처', '알레르기', '사이즈', '차량이용', '입금상태', '입금자명', '반', '조', '차량', '체크인'],
      ...confirmed.map(r => [
        r.participantName, r.grade, r.gender, r.birth,
        r.parentName, r.parentPhone, r.emergencyContact,
        r.allergies, r.tshirtSize, r.vehicleUsage,
        r.paymentStatus === 'deposited' ? '입금완료' : r.paymentStatus === 'pending' ? '미입금' : '환불',
        r.depositorName,
        getGroupName(r.groupId), getTeamName(r.teamId), getVehicleName(r.vehicleId),
        r.checkInAt ? '체크인' : '',
      ]),
    ]
    downloadCSV(`${event?.title || '명단'}_전체명단.csv`, rows)
  }

  const handleExportGroups = () => {
    for (const g of groups) {
      const members = confirmed.filter(r => r.groupId === g.id)
      const rows = [
        ['이름', '학년/부서', '조', '연락처', '알레르기', '차량'],
        ...members.map(r => [
          r.participantName, r.grade, getTeamName(r.teamId), r.parentPhone,
          r.allergies, getVehicleName(r.vehicleId),
        ]),
      ]
      downloadCSV(`${event?.title || '명단'}_${g.name}.csv`, rows)
    }
  }

  const handleExportVehicles = () => {
    for (const v of vehicles) {
      const riders = confirmed.filter(r => r.vehicleId === v.id)
      const rows = [
        ['이름', '학년/부서', '연락처', '알레르기'],
        ...riders.map(r => [r.participantName, r.grade, r.parentPhone, r.allergies]),
      ]
      downloadCSV(`${event?.title || '명단'}_${v.name}.csv`, rows)
    }
  }

  const handleExportEmergency = () => {
    const rows = [
      ['이름', '학년/부서', '보호자명', '보호자연락처', '비상연락처', '알레르기'],
      ...confirmed.map(r => [
        r.participantName, r.grade, r.parentName, r.parentPhone,
        r.emergencyContact, r.allergies,
      ]),
    ]
    downloadCSV(`${event?.title || '명단'}_비상연락망.csv`, rows)
  }

  if (loading || !event) return null

  const printList = (title: string, list: Registration[]) => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    printWindow.document.write(`
      <html><head><title>${title}</title>
      <style>
        body { font-family: 'Noto Sans KR', sans-serif; padding: 20px; }
        h1 { font-size: 18px; margin-bottom: 5px; }
        .info { font-size: 12px; color: #666; margin-bottom: 15px; }
        table { width: 100%; border-collapse: collapse; font-size: 11px; }
        th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
        th { background: #f5f5f5; font-weight: bold; }
        .checkin-box { width: 30px; height: 20px; border: 1px solid #ccc; display: inline-block; }
        @media print { @page { margin: 15mm; } }
      </style></head><body>
      <h1>${title}</h1>
      <p class="info">${event.title} | ${event.eventStart} ~ ${event.eventEnd} | ${event.location}</p>
      <table>
        <thead><tr><th>No</th><th>이름</th><th>학년/부서</th><th>성별</th><th>보호자연락처</th><th>알레르기</th><th>차량</th><th>체크인</th></tr></thead>
        <tbody>
          ${list.map((r, i) => `<tr>
            <td>${i + 1}</td>
            <td>${r.participantName}</td>
            <td>${r.grade}</td>
            <td>${r.gender}</td>
            <td>${r.parentPhone}</td>
            <td>${r.allergies || '-'}</td>
            <td>${getVehicleName(r.vehicleId)}</td>
            <td><span class="checkin-box"></span></td>
          </tr>`).join('')}
        </tbody>
      </table>
      <p style="margin-top:10px;font-size:10px;color:#999;">총 ${list.length}명 | 생성일: ${new Date().toLocaleDateString()}</p>
      <script>window.print()</script>
      </body></html>
    `)
    printWindow.document.close()
  }

  const printGroups = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    let html = `<html><head><title>반별 명단</title>
    <style>
      body { font-family: 'Noto Sans KR', sans-serif; padding: 20px; }
      h1 { font-size: 18px; margin-bottom: 5px; }
      .info { font-size: 12px; color: #666; margin-bottom: 15px; }
      .section { page-break-after: always; }
      h2 { font-size: 15px; margin: 15px 0 5px; }
      table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 20px; }
      th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
      th { background: #f5f5f5; }
      .checkin-box { width: 25px; height: 18px; border: 1px solid #ccc; display: inline-block; }
      @media print { @page { margin: 12mm; } }
    </style></head><body>
    <h1>${event.title} - 반별 명단</h1>
    <p class="info">${event.eventStart} ~ ${event.eventEnd} | ${event.location}</p>`

    for (const g of groups) {
      const members = confirmed.filter(r => r.groupId === g.id)
      if (members.length === 0) continue
      html += `<div class="section"><h2>${g.name} (${members.length}명)</h2>
      <table><thead><tr><th>No</th><th>이름</th><th>조</th><th>성별</th><th>연락처</th><th>알레르기</th><th>차량</th><th>체크인</th></tr></thead><tbody>`
      members.forEach((r, i) => {
        html += `<tr><td>${i + 1}</td><td>${r.participantName}</td><td>${getTeamName(r.teamId)}</td><td>${r.gender}</td><td>${r.parentPhone}</td><td>${r.allergies || '-'}</td><td>${getVehicleName(r.vehicleId)}</td><td><span class="checkin-box"></span></td></tr>`
      })
      html += `</tbody></table></div>`
    }

    html += `<p style="font-size:10px;color:#999;">총 ${confirmed.length}명 | 생성일: ${new Date().toLocaleDateString()}</p>
    <script>window.print()</script></body></html>`
    printWindow.document.write(html)
    printWindow.document.close()
  }

  return (
    <div className="bg-cs-warm-50 min-h-screen">
      <div className="container-custom py-6 max-w-3xl mx-auto">
        <Link href={`/school/events/manage/${id}`} className="inline-flex items-center gap-1.5 text-sm text-cs-navy-500 hover:text-cs-navy-700 mb-4">
          <ArrowLeft className="w-4 h-4" /> 행사 관리
        </Link>

        <h1 className="text-xl font-extrabold text-cs-navy-900 mb-6">명단 출력</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <button onClick={handleExportAll} className="card-flat p-5 bg-white text-left hover:shadow-card-hover transition-all group">
            <FileSpreadsheet className="w-8 h-8 text-cs-mint-500 mb-3" />
            <h3 className="font-bold text-cs-navy-900">전체 명단</h3>
            <p className="text-xs text-cs-navy-500 mt-1">전체 참가자 명단 (CSV)</p>
          </button>
          <button onClick={handleExportGroups} className="card-flat p-5 bg-white text-left hover:shadow-card-hover transition-all group">
            <Users className="w-8 h-8 text-blue-500 mb-3" />
            <h3 className="font-bold text-cs-navy-900">반별 명단</h3>
            <p className="text-xs text-cs-navy-500 mt-1">반별로 분리된 명단 (CSV)</p>
          </button>
          <button onClick={handleExportVehicles} className="card-flat p-5 bg-white text-left hover:shadow-card-hover transition-all group">
            <Truck className="w-8 h-8 text-cs-orange-500 mb-3" />
            <h3 className="font-bold text-cs-navy-900">차량별 탑승 명단</h3>
            <p className="text-xs text-cs-navy-500 mt-1">차량별 탑승자 명단 (CSV)</p>
          </button>
          <button onClick={handleExportEmergency} className="card-flat p-5 bg-white text-left hover:shadow-card-hover transition-all group">
            <Phone className="w-8 h-8 text-red-500 mb-3" />
            <h3 className="font-bold text-cs-navy-900">비상연락망</h3>
            <p className="text-xs text-cs-navy-500 mt-1">보호자 및 비상연락처 (CSV)</p>
          </button>
        </div>

        <h2 className="font-bold text-cs-navy-900 mb-4">인쇄용 명단</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button onClick={() => printList('출석체크용 명단', confirmed)} className="card-flat p-5 bg-white text-left hover:shadow-card-hover transition-all">
            <Printer className="w-8 h-8 text-cs-navy-500 mb-3" />
            <h3 className="font-bold text-cs-navy-900">출석체크용 명단</h3>
            <p className="text-xs text-cs-navy-500 mt-1">체크칸이 포함된 인쇄용 명단</p>
          </button>
          <button onClick={printGroups} className="card-flat p-5 bg-white text-left hover:shadow-card-hover transition-all">
            <FileText className="w-8 h-8 text-cs-navy-500 mb-3" />
            <h3 className="font-bold text-cs-navy-900">반별 인쇄 명단</h3>
            <p className="text-xs text-cs-navy-500 mt-1">반별로 구분된 인쇄용 명단</p>
          </button>
          <button onClick={() => printList('미입금자 명단', registrations.filter(r => r.paymentStatus === 'pending' && r.status !== 'cancelled'))} className="card-flat p-5 bg-white text-left hover:shadow-card-hover transition-all">
            <AlertTriangle className="w-8 h-8 text-cs-orange-500 mb-3" />
            <h3 className="font-bold text-cs-navy-900">미입금자 명단</h3>
            <p className="text-xs text-cs-navy-500 mt-1">입금이 확인되지 않은 참가자</p>
          </button>
        </div>

        <p className="text-xs text-cs-navy-400 mt-8 text-center">
          총 {confirmed.length}명 (확정) · {registrations.length}명 (전체)
        </p>
      </div>
    </div>
  )
}
