const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const htmlContent = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<title>2026년 8월 10일 큐티 다이어리 견본</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@400;700&family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Pretendard:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  @page {
    size: 297mm 210mm;
    margin: 0;
  }
  * {
    box-sizing: border-box;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  body {
    margin: 0;
    padding: 0;
    width: 297mm;
    height: 210mm;
    background: #0b0f19;
    font-family: 'Pretendard', sans-serif;
    color: #e2e8f0;
    overflow: hidden;
  }
  .planner-page {
    width: 297mm;
    height: 210mm;
    padding: 10mm 12mm;
    background: radial-gradient(circle at 10% 10%, #171d33 0%, #0b0f19 60%, #060911 100%);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
  }

  .watercolor-bg-1 {
    position: absolute;
    top: -50px;
    right: -50px;
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(99, 102, 241, 0.22) 0%, rgba(168, 85, 247, 0.14) 40%, transparent 70%);
    filter: blur(45px);
    pointer-events: none;
  }
  .watercolor-bg-2 {
    position: absolute;
    bottom: -50px;
    left: -50px;
    width: 450px;
    height: 450px;
    background: radial-gradient(circle, rgba(16, 185, 129, 0.18) 0%, rgba(14, 165, 233, 0.12) 50%, transparent 70%);
    filter: blur(55px);
    pointer-events: none;
  }

  .tab-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(18, 24, 41, 0.9);
    border: 1px solid rgba(99, 102, 241, 0.35);
    border-radius: 12px;
    padding: 6px 14px;
    backdrop-filter: blur(10px);
    margin-bottom: 8px;
    z-index: 10;
  }
  .tab-group {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .brand-tag {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 800;
    font-size: 11px;
    letter-spacing: 1.5px;
    color: #818cf8;
    margin-right: 8px;
  }
  .tab-btn {
    font-size: 10px;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 7px;
    background: rgba(255, 255, 255, 0.04);
    color: #94a3b8;
    border: 1px solid transparent;
  }
  .tab-btn.active-week {
    background: rgba(99, 102, 241, 0.2);
    color: #a5b4fc;
    border-color: rgba(129, 140, 248, 0.4);
  }
  .tab-btn.active-day {
    background: linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #10b981 100%);
    color: #ffffff;
    box-shadow: 0 2px 10px rgba(99, 102, 241, 0.4);
  }

  .spread-container {
    flex: 1;
    display: flex;
    gap: 14px;
    z-index: 10;
  }

  .page-panel {
    flex: 1;
    background: rgba(19, 25, 42, 0.92);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 16px 18px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
    position: relative;
    overflow: hidden;
  }
  .page-panel::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; height: 3px;
    background: linear-gradient(90deg, #10b981, #6366f1, #a855f7);
  }

  .panel-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    padding-bottom: 8px;
    margin-bottom: 10px;
  }
  .day-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 10.5px;
    font-weight: 700;
    color: #818cf8;
  }
  .day-num-tag {
    background: rgba(168, 85, 247, 0.25);
    border: 1px solid rgba(192, 132, 252, 0.4);
    color: #e9d5ff;
    padding: 1px 8px;
    border-radius: 12px;
    font-size: 9.5px;
    font-weight: 800;
  }
  .page-title {
    font-size: 15px;
    font-weight: 800;
    color: #f8fafc;
    margin: 2px 0 1px 0;
    letter-spacing: -0.3px;
  }
  .scripture-info {
    font-size: 10.5px;
    color: #94a3b8;
    font-weight: 500;
  }

  .key-verse-card {
    background: linear-gradient(135deg, rgba(30, 27, 75, 0.65) 0%, rgba(15, 23, 42, 0.85) 100%);
    border: 1px solid rgba(129, 140, 248, 0.35);
    border-left: 4px solid #10b981;
    border-radius: 12px;
    padding: 10px 14px;
    margin-bottom: 10px;
    position: relative;
  }
  .key-verse-tag {
    position: absolute;
    top: 6px;
    right: 10px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 8.5px;
    font-weight: 800;
    color: #34d399;
    letter-spacing: 1px;
  }
  .key-verse-text {
    font-family: 'Gowun Batang', serif;
    font-size: 13px;
    line-height: 1.6;
    color: #f1f5f9;
    margin: 0;
  }
  .key-verse-ref {
    text-align: right;
    font-size: 10px;
    font-weight: 700;
    color: #a5b4fc;
    margin-top: 3px;
  }

  .section-card {
    background: rgba(23, 30, 51, 0.75);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 12px;
    padding: 10px 13px;
    margin-bottom: 8px;
  }
  .section-card-title {
    font-size: 11px;
    font-weight: 800;
    color: #a5b4fc;
    margin-bottom: 5px;
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .section-card-body {
    font-size: 10.5px;
    line-height: 1.55;
    color: #cbd5e1;
  }
  .section-card-body ul {
    margin: 0;
    padding-left: 14px;
  }
  .section-card-body li {
    margin-bottom: 3px;
  }

  .tracker-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(23, 30, 51, 0.85);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    padding: 5px 12px;
    font-size: 10px;
    margin-bottom: 8px;
  }
  .tracker-item {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .pill {
    padding: 2px 8px;
    border-radius: 6px;
    font-weight: 700;
    font-size: 9.5px;
    background: rgba(16, 185, 129, 0.15);
    color: #6ee7b7;
    border: 1px solid rgba(52, 211, 153, 0.3);
  }
  .pill-purple {
    background: rgba(168, 85, 247, 0.15);
    color: #e9d5ff;
    border: 1px solid rgba(192, 132, 252, 0.3);
  }

  .diary-box {
    background: rgba(22, 30, 49, 0.85);
    border: 1px solid rgba(16, 185, 129, 0.2);
    border-radius: 11px;
    padding: 9px 12px;
  }
  .diary-box-title {
    font-size: 10.5px;
    font-weight: 800;
    color: #6ee7b7;
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .ruled-notes {
    background: rgba(13, 18, 32, 0.9);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 11px;
    padding: 8px 12px;
    background-image: linear-gradient(to bottom, transparent 21px, rgba(255, 255, 255, 0.06) 22px);
    background-size: 100% 22px;
    line-height: 22px;
    font-size: 10.5px;
    color: #e2e8f0;
    height: 110px;
  }

  .checklist-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 10px;
    margin-bottom: 3px;
    color: #cbd5e1;
  }
  .checkbox {
    width: 12px;
    height: 12px;
    border-radius: 3px;
    border: 1.5px solid #10b981;
    background: rgba(16, 185, 129, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 8.5px;
    color: #34d399;
    font-weight: bold;
  }

  .footer-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(16, 21, 36, 0.92);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    padding: 5px 12px;
    font-size: 9.5px;
    color: #64748b;
    z-index: 10;
  }
  .footer-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .footer-highlight {
    color: #818cf8;
    font-weight: 700;
  }
</style>
</head>
<body>

<div class="planner-page">
  <div class="watercolor-bg-1"></div>
  <div class="watercolor-bg-2"></div>

  <!-- 1. 상단 하이퍼링크 탭 네비게이션 -->
  <div class="tab-bar">
    <div class="tab-group">
      <span class="brand-tag">AUG 2026</span>
      <span class="tab-btn">🗓️ 8월 월간달력</span>
      <span class="tab-btn active-week">2주차 (8.8~8.14)</span>
    </div>
    <div class="tab-group">
      <span class="tab-btn">Day 8</span>
      <span class="tab-btn">Day 9</span>
      <span class="tab-btn active-day">Day 10 (8월 10일 월)</span>
      <span class="tab-btn">Day 11</span>
      <span class="tab-btn">Day 12</span>
      <span class="tab-btn">Day 13</span>
      <span class="tab-btn">Day 14</span>
      <span style="color:#64748b; font-size:9.5px;">... 31</span>
    </div>
  </div>

  <!-- 2. 양면 노트 컨테이너 (좌측: QT / 우측: 수채화 다이어리) -->
  <div class="spread-container">
    
    <!-- LEFT PANEL: 8월 10일 QT 묵상 -->
    <div class="page-panel">
      <div>
        <div class="panel-header">
          <div>
            <div class="day-badge">
              <span>🗓️ 2026년 8월 10일 월요일</span>
              <span class="day-num-tag">Day 10</span>
            </div>
            <div class="page-title">모든 것이 합력하여 선을 이루느니라</div>
            <div class="scripture-info">성경 본문: 로마서 8장 26절 ~ 30절</div>
          </div>
          <span style="font-size:9.5px; font-weight:800; color:#10b981; background:rgba(16,185,129,0.15); padding:3px 8px; border-radius:6px; border:1px solid rgba(16,185,129,0.3);">📖 QT 묵상 원고</span>
        </div>

        <!-- KEY VERSE -->
        <div class="key-verse-card">
          <span class="key-verse-tag">KEY VERSE</span>
          <p class="key-verse-text">“우리가 알거니와 하나님을 사랑하는 자 곧 그의 뜻대로 부르심을 입은 자들에게는 모든 것이 합력하여 선을 이루느니라”</p>
          <div class="key-verse-ref">— 로마서 8장 28절</div>
        </div>

        <!-- 1. 신학 해설 & 복음 조명 -->
        <div class="section-card">
          <div class="section-card-title">
            <span style="color:#818cf8;">✨ 1. 신학 해설 & 복음 조명</span>
          </div>
          <div class="section-card-body">
            성령께서는 마땅히 기도할 바를 알지 못하는 우리의 연약함을 도우시며 말할 수 없는 탄식으로 우리를 위하여 친히 간구하십니다. 우리가 겪는 고난과 예상치 못한 인생의 모든 곡절조차도, 하나님께서는 성도를 향한 당신의 선하신 장래와 예수 그리스도의 형상을 닮아가도록 인도하시는 조화로운 도구로 사용하십니다.
          </div>
        </div>

        <!-- 2. 오늘을 향한 성찰 질문 -->
        <div class="section-card">
          <div class="section-card-title">
            <span style="color:#c084fc;">🤍 2. 오늘을 향한 성찰 질문</span>
          </div>
          <div class="section-card-body">
            <ul>
              <li>최근 내 뜻대로 풀리지 않거나 이해하기 어려운 형편 속에서도, 하나님의 선하신 손길을 신뢰하고 있는가?</li>
              <li>연약함 중에 주저앉기보다 내 안에서 친히 간구하시는 성령님의 기도에 귀 기울이고 있는가?</li>
            </ul>
          </div>
        </div>
      </div>

      <div style="font-size:9.5px; color:#34d399; background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.2); padding:5px 9px; border-radius:7px;">
        💡 묵상을 마친 후 우측 다이어리 서식에 오늘의 감사와 일기를 작성하세요.
      </div>
    </div>

    <!-- RIGHT PANEL: 8월 10일 수채화 다이어리 서식 -->
    <div class="page-panel">
      <div>
        <div class="panel-header">
          <div>
            <div class="day-badge">
              <span style="color:#c084fc;">✍️ August 10th Daily Journal</span>
              <span class="day-num-tag" style="background:rgba(16,185,129,0.2); color:#6ee7b7; border-color:rgba(52,211,153,0.4);">수채화 노팅 서식</span>
            </div>
            <div class="page-title">오늘 하루 감사 & 영적 성찰 노트</div>
            <div class="scripture-info">태블릿 굿노트 / 프린트 인쇄 겸용 디지털 다이어리</div>
          </div>
          <span style="font-size:9.5px; font-weight:800; color:#c084fc; background:rgba(192,132,252,0.15); padding:3px 8px; border-radius:6px; border:1px solid rgba(192,132,252,0.3);">✍️ 다이어리 노트</span>
        </div>

        <!-- TRACKER BAR -->
        <div class="tracker-bar">
          <div class="tracker-item">
            <span style="color:#94a3b8; font-weight:700;">Weather:</span>
            <span class="pill">☀️ 맑음</span>
          </div>
          <div class="tracker-item">
            <span style="color:#94a3b8; font-weight:700;">Spiritual State:</span>
            <span class="pill-purple">🙏 은혜충만</span>
          </div>
        </div>

        <!-- GRID (3 GRATITUDES & PRAYER) -->
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 9px; margin-bottom: 8px;">
          <!-- 3 GRATITUDES -->
          <div class="diary-box">
            <div class="diary-box-title">
              <span>🌿 Today's 3 Gratitudes</span>
            </div>
            <div style="font-size:10px; line-height:1.5; color:#e2e8f0;">
              1. 8월 10일 새 주간에 로마서 8장 은혜를 누리게 하심에 감사<br>
              2. 고난 속에서도 합력하여 선을 이루시는 주님을 의지함에 감사<br>
              3. 동역자들과 함께 기도하며 축복할 수 있음에 감사
            </div>
          </div>

          <!-- PRAYER & ACTION -->
          <div class="diary-box" style="border-color:rgba(192,132,252,0.25);">
            <div class="diary-box-title" style="color:#c084fc;">
              <span>📌 Prayer & Action Steps</span>
            </div>
            <div style="font-size:10px; color:#cbd5e1; margin-bottom:4px;">
              • 성령님의 인도하심에 온전히 순종하게 하소서<br>
              • 합력하여 선을 이루실 하나님을 완전히 신뢰하게 하소서
            </div>
            <div class="checklist-item">
              <div class="checkbox">✓</div>
              <span>로마서 8:28 암송하고 마음에 새기기</span>
            </div>
            <div class="checklist-item">
              <div class="checkbox">✓</div>
              <span>불안할 때 3분 성령님 도움 기도하기</span>
            </div>
          </div>
        </div>

        <!-- RULED JOURNAL NOTES -->
        <div>
          <div style="font-size:10.5px; font-weight:800; color:#818cf8; margin-bottom:3px;">✒️ Daily Journal & Reflection (하루 일기 & 성찰)</div>
          <div class="ruled-notes">
            8월 10일 월요일 아침, 로마서 8장 28절 "하나님을 사랑하는 자 곧 그의 뜻대로 부르심을 입은 자들에게는 모든 것이 합력하여 선을 이루느니라"는 말씀을 깊이 묵상했다. 때로는 내 뜻대로 상황이 흘러가지 않고 예기치 못한 어려움을 겪을 때가 있지만, 하나님께서는 내가 다 이해할 수 없는 순간조차 당신의 선함을 완성해 나가시는 과정으로 사용하신다. 오늘 하루 연약함을 도우시는 성령님의 말할 수 없는 탄식과 기도(8:26)를 힘입어 당당하고 평안하게 승리하기로 다짐한다.
          </div>
        </div>
      </div>

    </div>
  </div>

  <!-- 3. 푸터 바 -->
  <div class="footer-bar">
    <div class="footer-left">
      <span>📖 2026 AUGUST QT DIARY</span>
      <span>•</span>
      <span class="footer-highlight">DAY 10 (8월 10일 월요일)</span>
      <span>•</span>
      <span>PAGE 21 OF 64</span>
    </div>
    <div>
      <span>◀ 이전 (8월 9일) &nbsp;|&nbsp; <strong style="color:#818cf8;">다음 (8월 11일) ▶</strong></span>
    </div>
  </div>
</div>

</body>
</html>
`;

fs.mkdirSync('public', { recursive: true });
const htmlPath = path.resolve('public/sample_diary.html');
const pdfPath = path.resolve('public/견본.pdf');
const pdfPath2 = path.resolve('public/8월10일_큐티다이어리_견본.pdf');

fs.writeFileSync(htmlPath, htmlContent, 'utf-8');
console.log('HTML file saved to:', htmlPath);

const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const cmd = `"${chromePath}" --headless --disable-gpu --no-margins --landscape --print-to-pdf="${pdfPath}" "file://${htmlPath}"`;

try {
  execSync(cmd);
  if (fs.existsSync(pdfPath)) {
    fs.copyFileSync(pdfPath, pdfPath2);
    const stats = fs.statSync(pdfPath);
    console.log('SUCCESS! PDF generated:', pdfPath, `(${stats.size} bytes)`);
    console.log('SUCCESS! PDF copied to:', pdfPath2);
  } else {
    console.error('PDF file was not created.');
  }
} catch (err) {
  console.error('Error rendering PDF with Chrome:', err);
}
