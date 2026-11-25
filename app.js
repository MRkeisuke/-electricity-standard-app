/* ==========================================================================
   E2 / Electric Standard (ESS) — Interactive 9-Screen Demo Application
   Pegged Reference: 1 kWh = 30 E2 | 150 E2 = 1.00 USDT (3,000 E2 = 20.00 USDT)
   ========================================================================== */

const E2_PER_KWH = 30;
const BASE_E2_PER_USDT = 150; // 3,000 E2 = 20.00 USDT
const STORAGE_KEY = 'ess_e2_demo_state_v1';

function createInitialState() {
  return {
    currentScreen: 2,
    loggedIn: true,
    did: 'did:ess:0x8F4a91B2...3C9',
    e2Balance: 4250,
    usdtBalance: 150.0,
    evSoc: 78,
    todayGainE2: 486,
    todaySpendE2: 214,
    greenKwhTotal: 141.7,
    v2hReflectedKwh: 141.7,
    aiMode: 'eco',
    usdtRateE2: 150, // 150 E2 = 1 USDT
    devices: [
      { id: 'ev-1', icon: '🚗', name: 'Nissan Ariya e-4ORCE', type: 'EV車両 (91 kWh)', status: 'connected', meta: 'SOC 78% • V2V/V2H対応' },
      { id: 'scg-1', icon: '⚛️', name: '超電導発電機 SCG-MK4-0042', type: '源泉発電ユニット', status: 'connected', meta: '77.2K 臨界内 • 14.8 kW' },
      { id: 'v2h-1', icon: '🏠', name: '自宅スマートメーター & V2H #09', type: 'ホームグリッド', status: 'connected', meta: '双方向同期ON • 6.0 kW' }
    ],
    solarPlants: [
      {
        id: 'sunrise',
        name: 'Sunrise Solar Plant（山梨サンライズ太陽光）',
        region: '山梨県北杜市',
        availKwh: 500,
        e2PerKwh: 30,
        usdtPerKwh: 0.20,
        cert: '非化石・グリーン電力証書 100%',
        type: 'メガソーラー'
      },
      {
        id: 'miyako',
        name: '宮古島オフグリッド太陽光パーク',
        region: '沖縄県宮古島市',
        availKwh: 380,
        e2PerKwh: 30,
        usdtPerKwh: 0.19,
        cert: '離島再エネマイクログリッド認証',
        type: '太陽光＋蓄電池'
      },
      {
        id: 'nagano',
        name: '長野アルプス ソーラー＆小水力発電所',
        region: '長野県松本市',
        availKwh: 640,
        e2PerKwh: 30,
        usdtPerKwh: 0.21,
        cert: '24/7 カーボンフリー電力認証',
        type: 'ハイブリッド再エネ'
      }
    ],
    selectedPlantId: 'sunrise',
    generator: {
      mode: 'rated', // rated | eco | standby
      outputKw: 14.82,
      efficiency: 98.4,
      tempK: 77.2,
      uptime: 96.8,
      totalKwh: 18420.6,
      pendingE2: 42.6,
      lifetimeE2: 552618,
      history: [
        { time: '本日 18:00', kwh: 14.5, e2: 435, note: '超電導定格発電 自動ミント' },
        { time: '本日 12:00', kwh: 14.9, e2: 447, note: '超電導定格発電 自動ミント' },
        { time: '本日 06:00', kwh: 13.8, e2: 414, note: '夜間エコ発電 自動ミント' },
        { time: '昨日 18:00', kwh: 14.6, e2: 438, note: '超電導定格発電 自動ミント' }
      ]
    },
    transactions: [
      {
        id: 'TX-9048',
        time: '2026/11/25 20:42',
        counterparty: 'Sunrise Solar Plant（山梨）',
        category: '再エネ購入',
        direction: 'gain',
        kwh: 50.0,
        e2: 1500,
        usdtDelta: -10.0,
        hash: '0x7a9f4c2e11b8d304e91f6a228c0b4d1193a8f2e1',
        block: 19482104,
        origin: '太陽光発電 100%（グリーン証書 #G-88412）'
      },
      {
        id: 'TX-9047',
        time: '2026/11/25 18:15',
        counterparty: '超電導発電機 SCG-MK4-0042',
        category: '自動発電ミント',
        direction: 'gain',
        kwh: 14.5,
        e2: 435,
        usdtDelta: 0,
        hash: '0x3b81e09a44f2c710d8e4a9b201f7c6654e2a19d0',
        block: 19481920,
        origin: '超電導源泉発電（効率 98.4% / 77.2K）'
      },
      {
        id: 'TX-9046',
        time: '2026/11/25 15:30',
        counterparty: 'EV: Tesla Model 3 (Owner: Tanaka)',
        category: 'V2V エネルギー交換',
        direction: 'gain',
        kwh: 8.2,
        e2: 246,
        usdtDelta: 0,
        hash: '0x9c42b17f88d1e003a7b5c490e12d3f4488a1c7b2',
        block: 19481655,
        origin: 'V2V ピアツーピア送電（DC 400V）'
      },
      {
        id: 'TX-9045',
        time: '2026/11/25 12:08',
        counterparty: '青山ソーラーカフェ EV急速ポート #03',
        category: 'QR決済',
        direction: 'spend',
        kwh: 7.13,
        e2: -214,
        usdtDelta: 0,
        hash: '0x5e10a88c22b4f901c3d7e612a98b0f3321d4e8a9',
        block: 19481302,
        origin: 'ローカル施設急速充電（ESS-QR）'
      },
      {
        id: 'TX-9044',
        time: '2026/11/24 21:50',
        counterparty: 'ESS ⇄ USDT 流動性プール',
        category: 'USDTスワップ',
        direction: 'spend',
        kwh: 25.0,
        e2: -750,
        usdtDelta: 5.0,
        hash: '0x1d77f34b99a2e118b6c0d543f87a9e2210c3b6f4',
        block: 19480811,
        origin: 'E2 → USDT 双方向スワップ（ERC-20 Bridge）'
      }
    ],
    settings: {
      autoMatch: true,
      priceCap: 32.0,
      batteryAlert: true,
      socMin: 25,
      bioLock: true,
      autoV2h: true
    }
  };
}

let state = loadState();

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return Object.assign(createInitialState(), parsed);
    }
  } catch (e) {
    // ignore storage errors
  }
  return createInitialState();
}

function persistState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    // ignore
  }
}

function resetDemoData() {
  if (v2vState.active) stopV2vTransfer(false);
  localStorage.removeItem(STORAGE_KEY);
  state = createInitialState();
  syncAllUI();
  navigateTo(2);
  showToast('デモデータを初期状態（4,250 E2 / 150.00 USDT）にリセットしました。', 'cyan');
}

/* ==================== NAVIGATION & VIEW MODE ==================== */
function navigateTo(screenNum) {
  state.currentScreen = screenNum;
  document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
  const target = document.getElementById(`screen-${screenNum}`);
  if (target) target.classList.add('active');

  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.toggle('active', Number(btn.dataset.screen) === screenNum);
  });
  document.querySelectorAll('.m-nav-btn').forEach(btn => {
    btn.classList.toggle('active', Number(btn.dataset.screen) === screenNum);
  });

  // Close mobile drawer if open
  document.getElementById('sidebar').classList.remove('open');

  // Redraw canvas charts when entering screen 2 or 7
  if (screenNum === 2) setTimeout(drawDashWaveChart, 40);
  if (screenNum === 7) setTimeout(drawEconChart, 40);
  if (screenNum === 9) {
    renderSolarPlants();
    updateBuyPreview();
    updateSwapCalc();
  }
  persistState();
}

function setViewMode(mode) {
  const isMobile = mode === 'mobile';
  document.body.classList.toggle('mobile-preview', isMobile);
  document.getElementById('btnViewWide').classList.toggle('active', !isMobile);
  document.getElementById('btnViewMobile').classList.toggle('active', isMobile);
  setTimeout(() => {
    if (state.currentScreen === 2) drawDashWaveChart();
    if (state.currentScreen === 7) drawEconChart();
  }, 120);
}

document.getElementById('mobileMenuBtn').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('open');
});

/* ==================== HELPERS: TOAST & MODAL ==================== */
function showToast(message, variant = 'cyan') {
  const container = document.getElementById('toastContainer');
  const el = document.createElement('div');
  el.className = `toast ${variant}`;
  const icon = variant === 'emerald' ? '✅' : variant === 'amber' ? '⚠️' : '⚡';
  el.innerHTML = `<span style="font-size:1rem;">${icon}</span><div style="line-height:1.45;">${message}</div>`;
  container.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(10px)';
    el.style.transition = 'all 0.25s';
    setTimeout(() => el.remove(), 260);
  }, 3600);
}

function openModal(title, htmlContent) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalBody').innerHTML = htmlContent;
  document.getElementById('appModal').classList.add('open');
}

function closeModal() {
  document.getElementById('appModal').classList.remove('open');
}

function randomTxHash() {
  const hex = '0123456789abcdef';
  let out = '0x';
  for (let i = 0; i < 40; i++) out += hex[Math.floor(Math.random() * 16)];
  return out;
}

function nowFormatted() {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function addTransaction({ counterparty, category, direction, kwh, e2, usdtDelta = 0, origin }) {
  const tx = {
    id: 'TX-' + (9049 + state.transactions.length),
    time: nowFormatted(),
    counterparty,
    category,
    direction,
    kwh: Number(Math.abs(kwh).toFixed(2)),
    e2: Math.round(e2),
    usdtDelta: Number(usdtDelta.toFixed(2)),
    hash: randomTxHash(),
    block: 19482150 + state.transactions.length * 7,
    origin
  };
  state.transactions.unshift(tx);
  if (e2 > 0) state.todayGainE2 += Math.round(e2);
  if (e2 < 0) state.todaySpendE2 += Math.round(Math.abs(e2));
  persistState();
  return tx;
}

/* ==================== GLOBAL BALANCE & UI SYNC ==================== */
function syncAllUI() {
  const e2Fmt = Math.round(state.e2Balance).toLocaleString('ja-JP');
  const kwhNum = state.e2Balance / E2_PER_KWH;
  const kwhFmt = kwhNum.toFixed(2);
  const usdtFmt = state.usdtBalance.toFixed(2);

  // Top bar & sidebar
  document.getElementById('topE2Balance').textContent = `${e2Fmt} E2`;
  document.getElementById('topUsdtBalance').textContent = `${usdtFmt} USDT`;
  document.getElementById('sidebarDid').textContent = state.did;
  document.getElementById('sidebarUsdtRate').textContent = `${state.usdtRateE2} E2 = 1.00 USDT`;

  // Dashboard
  document.getElementById('dashE2Balance').textContent = e2Fmt;
  document.getElementById('dashKwhBalance').textContent = kwhFmt;
  document.getElementById('dashUsdtBalance').textContent = usdtFmt;
  document.getElementById('dashEvSoc').textContent = state.evSoc;
  document.getElementById('dashTodayGain').textContent = Math.round(state.todayGainE2).toLocaleString('ja-JP');
  document.getElementById('dashTodaySpend').textContent = Math.round(state.todaySpendE2).toLocaleString('ja-JP');
  const net = Math.round(state.todayGainE2 - state.todaySpendE2);
  document.getElementById('dashTodayNet').textContent = (net >= 0 ? '+' : '') + net.toLocaleString('ja-JP');
  updateAiForecast();

  // Wallet (Screen 6)
  document.getElementById('walletE2Balance').textContent = e2Fmt;
  document.getElementById('walletKwhBalance').textContent = kwhFmt;
  document.getElementById('walletUsdtBalance').textContent = usdtFmt;
  document.getElementById('walletTxCount').textContent = `${state.transactions.length} 件`;
  renderTxList();

  // Market (Screen 9)
  document.getElementById('mktE2Balance').textContent = e2Fmt;
  document.getElementById('mktUsdtBalance').textContent = usdtFmt;
  document.getElementById('mktGreenKwh').textContent = `${state.greenKwhTotal.toFixed(1)} kWh`;
  document.getElementById('mktCo2Val').textContent = `${(state.greenKwhTotal * 0.45).toFixed(1)} kg`;
  document.getElementById('v2hReflectedKwh').textContent = `${state.v2hReflectedKwh.toFixed(1)} kWh`;
  renderSolarPlants();
  updateBuyPreview();
  updateSwapCalc();

  // Devices (Screen 1 & 8)
  renderDeviceLists();

  // Generator (Screen 5)
  renderGeneratorUI();

  // QR Summary (Screen 4)
  updateQrSummary();

  // Settings (Screen 8)
  document.getElementById('setAutoMatch').checked = state.settings.autoMatch;
  document.getElementById('setPriceCap').value = state.settings.priceCap;
  document.getElementById('setPriceCapVal').textContent = Number(state.settings.priceCap).toFixed(1);
  document.getElementById('setBatteryAlert').checked = state.settings.batteryAlert;
  document.getElementById('setSocMin').value = state.settings.socMin;
  document.getElementById('setSocMinVal').textContent = state.settings.socMin;
  document.getElementById('setBioLock').checked = state.settings.bioLock;
  document.getElementById('setAutoV2h').checked = state.settings.autoV2h;
}

/* ==================== SCREEN 1: LOGIN & WALLET AUTH ==================== */
function renderDeviceLists() {
  const connectedCount = state.devices.filter(d => d.status === 'connected').length;
  const badge = document.getElementById('linkedCountBadge');
  if (badge) badge.textContent = `${connectedCount}/${state.devices.length} 接続中`;

  const html = state.devices.map((d, idx) => {
    const isOn = d.status === 'connected';
    return `
      <div class="device-status-item" onclick="toggleDeviceConnection(${idx})">
        <div style="display:flex;align-items:center;gap:10px;min-width:0;">
          <span style="font-size:1.25rem;">${d.icon}</span>
          <div style="min-width:0;">
            <div style="font-size:0.84rem;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${d.name}</div>
            <div style="font-size:0.72rem;color:var(--text-secondary);">${d.type} • ${d.meta}</div>
          </div>
        </div>
        <span class="badge ${isOn ? 'badge-emerald' : 'badge-amber'}">${isOn ? '● 接続済' : '○ 待機中'}</span>
      </div>
    `;
  }).join('');

  const loginList = document.getElementById('loginDeviceList');
  const settingsList = document.getElementById('settingsDeviceList');
  if (loginList) loginList.innerHTML = html;
  if (settingsList) settingsList.innerHTML = html;
}

function toggleDeviceConnection(idx) {
  const d = state.devices[idx];
  d.status = d.status === 'connected' ? 'standby' : 'connected';
  persistState();
  renderDeviceLists();
  showToast(`${d.name} を「${d.status === 'connected' ? '接続済' : '待機中'}」に切り替えました。`);
}

function performBiometricLogin() {
  const btn = document.getElementById('bioLoginBtn');
  const txt = document.getElementById('bioLoginText');
  btn.classList.add('scanning');
  txt.textContent = '生体認証スキャン中...（暗号鍵を検証）';
  setTimeout(() => {
    btn.classList.remove('scanning');
    txt.textContent = '生体認証でログイン（Face ID / Touch ID）';
    state.loggedIn = true;
    document.getElementById('loginSessionBadge').textContent = '生体認証ログイン済';
    showToast('Face ID 認証に成功しました。ESSウォレットを同期しました。', 'emerald');
    navigateTo(2);
  }, 900);
}

function performIdLogin() {
  const val = document.getElementById('loginIdInput').value.trim();
  if (!val) {
    showToast('ウォレットIDまたは車両IDを入力してください。', 'amber');
    return;
  }
  state.loggedIn = true;
  showToast(`ID「${val}」でログインしました。`, 'emerald');
  navigateTo(2);
}

function openNewWalletModal() {
  const newDid = 'did:ess:0x' + Math.random().toString(16).substring(2, 10).toUpperCase() + '...E2';
  openModal('新規 E2 ウォレット作成（デモ）', `
    <div class="stack-md">
      <p style="font-size:0.83rem;color:var(--text-secondary);">
        ESS電気本位制ネットワーク上に新しい分散型ID（DID）とE2ウォレットを生成します。
      </p>
      <div class="ai-meter-box stack-sm">
        <div class="detail-kv"><span class="detail-k">生成された ESS-DID</span><span class="detail-v mono" style="color:var(--cyan);">${newDid}</span></div>
        <div class="detail-kv"><span class="detail-k">リカバリーフレーズ（例）</span><span class="detail-v mono" style="font-size:0.75rem;color:var(--emerald-bright);">solar grid volt pulse clean watt</span></div>
        <div class="detail-kv"><span class="detail-k">初期ウェルカム付与</span><span class="detail-v mono">+300 E2（10.0 kWh）</span></div>
      </div>
      <button class="btn btn-emerald btn-block" onclick="completeCreateWallet('${newDid}')">このウォレットを有効化してログイン</button>
    </div>
  `);
}

function completeCreateWallet(newDid) {
  state.did = newDid;
  state.e2Balance += 300;
  addTransaction({
    counterparty: 'ESS Genesis Welcome Pool',
    category: '新規ウォレット特典',
    direction: 'gain',
    kwh: 10.0,
    e2: 300,
    origin: '新規ESS-DID開通ボーナス'
  });
  closeModal();
  syncAllUI();
  showToast(`新規ウォレット ${newDid} を作成し、+300 E2 を付与しました！`, 'emerald');
  navigateTo(2);
}

function logoutToScreen1() {
  state.loggedIn = false;
  document.getElementById('loginSessionBadge').textContent = 'ログアウト中';
  navigateTo(1);
  showToast('ログアウトしました。生体認証またはIDで再ログインできます。');
}

/* ==================== SCREEN 2: DASHBOARD & REAL-TIME WAVEFORM ==================== */
function setAiMode(mode, btn) {
  state.aiMode = mode;
  btn.parentElement.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  updateAiForecast();
}

function updateAiForecast() {
  const kwh = state.e2Balance / E2_PER_KWH;
  const profiles = {
    eco: { dailyKwh: 10.5, kmPerKwh: 6.5, advice: '省エネモード稼働中：明日の晴天予測により太陽光余剰が見込まれます。余剰分をV2V供給すると約 +180 E2 の獲得が期待できます。' },
    std: { dailyKwh: 13.2, kmPerKwh: 5.8, advice: '標準モード：現在の保有電力量は世帯平均の約10日分以上です。夕方ピーク帯のV2H放電を自動優先しています。' },
    pwr: { dailyKwh: 17.8, kmPerKwh: 4.9, advice: 'パワーモード：高速走行・暖房負荷が高い予測です。画面⑨のSunrise Solar Plantから安価な再エネE2を追加購入すると効率的です。' }
  };
  const p = profiles[state.aiMode] || profiles.eco;
  document.getElementById('aiDaysVal').textContent = (kwh / p.dailyKwh).toFixed(1);
  document.getElementById('aiDaysSub').textContent = `平均消費 ${p.dailyKwh} kWh/日`;
  document.getElementById('aiKmVal').textContent = Math.round(kwh * p.kmPerKwh).toLocaleString('ja-JP');
  document.getElementById('aiKmSub').textContent = `電費 ${p.kmPerKwh} km/kWh 予測`;
  document.getElementById('aiAdviceText').textContent = p.advice;
}

// Waveform history buffers (36 points)
const waveGainData = Array.from({ length: 36 }, (_, i) => 4.2 + Math.sin(i * 0.35) * 0.7 + Math.random() * 0.3);
const waveSpendData = Array.from({ length: 36 }, (_, i) => 2.1 + Math.cos(i * 0.28) * 0.45 + Math.random() * 0.25);

function tickDashWave() {
  const baseGain = state.generator.mode === 'standby' ? 1.4 : state.generator.mode === 'eco' ? 3.5 : 4.8;
  const nextGain = Math.max(0.4, baseGain + (Math.random() - 0.48) * 0.65);
  const nextSpend = Math.max(0.5, 2.15 + (Math.random() - 0.5) * 0.55);

  waveGainData.push(nextGain);
  waveGainData.shift();
  waveSpendData.push(nextSpend);
  waveSpendData.shift();

  const net = nextGain - nextSpend;
  const elG = document.getElementById('liveGainKw');
  const elS = document.getElementById('liveSpendKw');
  const elN = document.getElementById('liveNetKw');
  if (elG) elG.textContent = nextGain.toFixed(2);
  if (elS) elS.textContent = nextSpend.toFixed(2);
  if (elN) {
    elN.textContent = (net >= 0 ? '+' : '') + net.toFixed(2);
    elN.style.color = net >= 0 ? '#22d3ee' : '#fb7185';
  }
  if (state.currentScreen === 2) drawDashWaveChart();
}

function drawDashWaveChart() {
  const canvas = document.getElementById('dashWaveCanvas');
  if (!canvas) return;
  const rect = canvas.parentElement.getBoundingClientRect();
  if (rect.width < 10) return;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  const w = rect.width;
  const h = rect.height;
  const pad = { top: 18, right: 14, bottom: 26, left: 38 };
  const plotW = w - pad.left - pad.right;
  const plotH = h - pad.top - pad.bottom;

  ctx.clearRect(0, 0, w, h);

  // Horizontal grid lines
  const maxVal = 7;
  ctx.strokeStyle = 'rgba(148,163,184,0.12)';
  ctx.lineWidth = 1;
  ctx.font = '11px ui-monospace, SFMono-Regular, monospace';
  ctx.fillStyle = '#64748b';

  for (let v = 0; v <= 6; v += 2) {
    const y = pad.top + plotH - (v / maxVal) * plotH;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(w - pad.right, y);
    ctx.stroke();
    ctx.fillText(`${v}kW`, 4, y + 4);
  }

  function plotSeries(data, strokeColor, fillTop, fillBot) {
    const stepX = plotW / (data.length - 1);
    ctx.beginPath();
    data.forEach((val, idx) => {
      const x = pad.left + idx * stepX;
      const y = pad.top + plotH - (Math.min(maxVal, val) / maxVal) * plotH;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2.4;
    ctx.stroke();

    // Area gradient
    ctx.lineTo(pad.left + plotW, pad.top + plotH);
    ctx.lineTo(pad.left, pad.top + plotH);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + plotH);
    grad.addColorStop(0, fillTop);
    grad.addColorStop(1, fillBot);
    ctx.fillStyle = grad;
    ctx.fill();
  }

  plotSeries(waveGainData, '#1ce89c', 'rgba(28,232,156,0.26)', 'rgba(28,232,156,0.0)');
  plotSeries(waveSpendData, '#fb7185', 'rgba(251,113,133,0.22)', 'rgba(251,113,133,0.0)');

  // X-axis labels
  ctx.fillStyle = '#64748b';
  ctx.fillText('-30秒', pad.left, h - 6);
  ctx.fillText('-15秒', pad.left + plotW * 0.47, h - 6);
  ctx.fillText('LIVE', w - pad.right - 28, h - 6);
}

/* ==================== SCREEN 3: V2V ENERGY EXCHANGE ==================== */
const v2vPeers = [
  { id: 'p1', name: 'Tesla Model Y (Tanaka)', role: 'receive', dist: '180m', soc: '28%', maxKw: 22.0, x: 375, y: 100, rate: 31.0 },
  { id: 'p2', name: 'Hyundai IONIQ 5 (Suzuki)', role: 'send', dist: '340m', soc: '92%', maxKw: 18.0, x: 145, y: 112, rate: 29.0 },
  { id: 'p3', name: 'BYD SEAL (Watanabe)', role: 'receive', dist: '520m', soc: '34%', maxKw: 15.0, x: 390, y: 245, rate: 30.5 },
  { id: 'p4', name: '地域V2V給電ステーション #04', role: 'send', dist: '780m', soc: '100%', maxKw: 50.0, x: 130, y: 252, rate: 28.5 }
];

let v2vState = {
  myRole: 'send', // 'send' (sell) | 'receive' (buy)
  selectedPeerId: 'p1',
  rate: 30.0,
  active: false,
  elapsedSec: 0,
  totalKwh: 0,
  totalE2: 0,
  timer: null
};

function renderV2vMap() {
  const g = document.getElementById('v2vPeerNodes');
  if (!g) return;
  const peer = v2vPeers.find(p => p.id === v2vState.selectedPeerId) || v2vPeers[0];

  // Update beam line
  const beam = document.getElementById('v2vBeamLine');
  beam.setAttribute('x2', peer.x);
  beam.setAttribute('y2', peer.y);
  beam.setAttribute('stroke', v2vState.active ? '#1ce89c' : '#22d3ee');
  beam.setAttribute('opacity', v2vState.active ? '0.95' : '0.4');
  beam.setAttribute('stroke-width', v2vState.active ? '3.5' : '2');

  g.innerHTML = v2vPeers.map(p => {
    const isSel = p.id === peer.id;
    const col = p.role === 'send' ? '#1ce89c' : '#22d3ee';
    return `
      <g class="peer-node" transform="translate(${p.x},${p.y})" onclick="selectV2vPeer('${p.id}')">
        ${isSel ? `<circle r="22" fill="none" stroke="${col}" stroke-width="2" stroke-dasharray="4 3" opacity="0.9"/>` : ''}
        <circle r="13" fill="rgba(7,17,34,0.92)" stroke="${col}" stroke-width="${isSel ? 2.5 : 1.6}"/>
        <circle r="5" fill="${col}"/>
        <text y="-19" text-anchor="middle" fill="#f1f5f9" font-size="10.5" font-weight="700">${p.name.split(' ')[0]} ${p.name.split(' ')[1] || ''}</text>
        <text y="25" text-anchor="middle" fill="${col}" font-size="9.5" font-family="monospace">${p.role === 'send' ? '送電可' : '受電希望'} • ${p.dist}</text>
      </g>
    `;
  }).join('');

  document.getElementById('v2vSelectedPeerBox').innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
      <div>
        <div style="font-size:0.86rem;font-weight:800;color:#fff;">選択相手: ${peer.name}</div>
        <div style="font-size:0.74rem;color:var(--text-secondary);">距離 ${peer.dist} • 相手SOC ${peer.soc} • 最大対応出力 ${peer.maxKw} kW</div>
      </div>
      <span class="badge ${peer.role === 'send' ? 'badge-emerald' : 'badge-cyan'}">${peer.role === 'send' ? '送電側（供給）' : '受電側（需要）'}</span>
    </div>
  `;
}

function selectV2vPeer(id) {
  if (v2vState.active) {
    showToast('送受電中は相手を変更できません。先に停止してください。', 'amber');
    return;
  }
  v2vState.selectedPeerId = id;
  const peer = v2vPeers.find(p => p.id === id);
  if (peer) {
    v2vState.rate = peer.rate;
    document.getElementById('v2vRateSlider').value = peer.rate;
    document.getElementById('v2vRateLabel').textContent = peer.rate.toFixed(1);
  }
  renderV2vMap();
}

function setV2vRole(role) {
  if (v2vState.active) {
    showToast('送受電を停止してからモードを切り替えてください。', 'amber');
    return;
  }
  v2vState.myRole = role;
  document.getElementById('v2vModeSend').classList.toggle('active', role === 'send');
  document.getElementById('v2vModeRecv').classList.toggle('active', role === 'receive');
  document.getElementById('v2vToggleBtn').textContent = role === 'send' ? '⚡ 送電を開始する' : '🔋 受電を開始する';
}

function updateV2vRate(val) {
  v2vState.rate = parseFloat(val);
  document.getElementById('v2vRateLabel').textContent = v2vState.rate.toFixed(1);
}

function toggleV2vTransfer() {
  if (!v2vState.active) startV2vTransfer();
  else stopV2vTransfer(true);
}

function startV2vTransfer() {
  v2vState.active = true;
  v2vState.elapsedSec = 0;
  v2vState.totalKwh = 0;
  v2vState.totalE2 = 0;

  const btn = document.getElementById('v2vToggleBtn');
  btn.className = 'btn btn-danger btn-block';
  btn.textContent = '⏹ 送受電を停止して自動決済する';
  document.getElementById('v2vStatusBadge').textContent = v2vState.myRole === 'send' ? '⚡ 送電中 LIVE' : '🔋 受電中 LIVE';
  document.getElementById('v2vStatusBadge').className = 'badge badge-emerald';
  renderV2vMap();

  const peer = v2vPeers.find(p => p.id === v2vState.selectedPeerId) || v2vPeers[0];
  showToast(`${peer.name} とのV2Vコネクションを確立しました。リアルタイム決済を開始します。`, 'emerald');

  v2vState.timer = setInterval(() => {
    v2vState.elapsedSec += 1;
    // Demo accelerated transfer (approx 16-20 kW displayed, accelerated kWh accumulation for smooth demo)
    const kw = Math.min(peer.maxKw, 16.5 + Math.sin(v2vState.elapsedSec * 0.6) * 1.4 + Math.random() * 0.6);
    const amp = (kw * 1000) / 400;
    const deltaKwh = kw / 120; // accelerated for live demo visibility
    v2vState.totalKwh += deltaKwh;
    v2vState.totalE2 = v2vState.totalKwh * v2vState.rate;

    document.getElementById('v2vLiveKw').textContent = kw.toFixed(2);
    document.getElementById('v2vLiveAmp').textContent = amp.toFixed(1);
    document.getElementById('v2vLiveVolt').textContent = 'DC 400V 同期中';
    document.getElementById('v2vTotalKwh').textContent = v2vState.totalKwh.toFixed(3);
    document.getElementById('v2vTotalE2').textContent = v2vState.totalE2.toFixed(1);

    const mm = String(Math.floor(v2vState.elapsedSec / 60)).padStart(2, '0');
    const ss = String(v2vState.elapsedSec % 60).padStart(2, '0');
    document.getElementById('v2vElapsed').textContent = `${mm}:${ss}`;
  }, 500);
}

function stopV2vTransfer(showSummary = true) {
  clearInterval(v2vState.timer);
  v2vState.active = false;

  const btn = document.getElementById('v2vToggleBtn');
  btn.className = 'btn btn-emerald btn-block';
  btn.textContent = v2vState.myRole === 'send' ? '⚡ 送電を開始する' : '🔋 受電を開始する';
  document.getElementById('v2vStatusBadge').textContent = '待機中';
  document.getElementById('v2vStatusBadge').className = 'badge badge-cyan';
  document.getElementById('v2vLiveKw').textContent = '0.00';
  document.getElementById('v2vLiveAmp').textContent = '0.0';
  document.getElementById('v2vLiveVolt').textContent = 'DC 400V 待機';
  renderV2vMap();

  if (showSummary && v2vState.totalKwh > 0) {
    const peer = v2vPeers.find(p => p.id === v2vState.selectedPeerId) || v2vPeers[0];
    const settledE2 = Math.max(1, Math.round(v2vState.totalE2));
    const signedE2 = v2vState.myRole === 'send' ? settledE2 : -settledE2;

    state.e2Balance = Math.max(0, state.e2Balance + signedE2);
    const tx = addTransaction({
      counterparty: peer.name,
      category: 'V2V エネルギー交換',
      direction: signedE2 >= 0 ? 'gain' : 'spend',
      kwh: v2vState.totalKwh,
      e2: signedE2,
      origin: `V2V ${v2vState.myRole === 'send' ? '送電（売電）' : '受電（買電）'} • 単価 ${v2vState.rate.toFixed(1)} E2/kWh`
    });
    syncAllUI();

    openModal('⚡ V2V 取引完了・自動決済サマリー', `
      <div class="stack-md">
        <div style="text-align:center;padding:12px;border-radius:14px;background:rgba(28,232,156,0.12);border:1px solid rgba(28,232,156,0.35);">
          <div style="font-size:0.76rem;color:var(--text-secondary);">自動決済完了（スマートコントラクト）</div>
          <div class="mono" style="font-size:1.75rem;font-weight:900;color:${signedE2 >= 0 ? 'var(--emerald-bright)' : 'var(--rose)'};margin-top:4px;">
            ${signedE2 >= 0 ? '+' : ''}${signedE2.toLocaleString('ja-JP')} E2
          </div>
          <div class="mono" style="font-size:0.8rem;color:var(--cyan);">${v2vState.totalKwh.toFixed(3)} kWh</div>
        </div>
        <div class="ai-meter-box">
          <div class="detail-kv"><span class="detail-k">取引相手</span><span class="detail-v">${peer.name}</span></div>
          <div class="detail-kv"><span class="detail-k">取引種別</span><span class="detail-v">${v2vState.myRole === 'send' ? '送電（E2獲得）' : '受電（E2支払）'}</span></div>
          <div class="detail-kv"><span class="detail-k">適用単価</span><span class="detail-v mono">${v2vState.rate.toFixed(1)} E2 / kWh</span></div>
          <div class="detail-kv"><span class="detail-k">Tx Hash</span><span class="detail-v mono" style="font-size:0.72rem;color:var(--cyan);">${tx.hash.slice(0, 22)}...</span></div>
        </div>
        <button class="btn btn-emerald btn-block" onclick="closeModal()">確認して閉じる</button>
      </div>
    `);
  }
}

/* ==================== SCREEN 4: QR PAYMENT & LOCAL POWER SHARE ==================== */
const qrPresets = [
  { name: '青山ソーラーカフェ EV急速ポート #03', addr: 'ess:fac:0x4A91...E203', rate: 30, origin: '太陽光 100%（グリーン証書付）' },
  { name: '隣接EV: Model Y (Owner: Sato)', addr: 'ess:ev:0x7B20...A91C', rate: 28, origin: 'V2L ローカル個人間電力シェア' },
  { name: '地域防災マイクログリッド端末 B-12', addr: 'ess:grid:0x9F11...00B2', rate: 25, origin: '防災備蓄・地域共有マイクログリッド' }
];
let currentQrPreset = qrPresets[0];

function setQrTab(tab) {
  document.getElementById('qrTabScan').classList.toggle('active', tab === 'scan');
  document.getElementById('qrTabMine').classList.toggle('active', tab === 'mine');
  document.getElementById('qrScanPanel').style.display = tab === 'scan' ? '' : 'none';
  document.getElementById('qrMinePanel').style.display = tab === 'mine' ? '' : 'none';
}

function scanPresetQr(idx) {
  currentQrPreset = qrPresets[idx];
  document.getElementById('qrScanTargetLabel').textContent = `読取完了: ${currentQrPreset.name}`;
  document.getElementById('qrCounterparty').textContent = currentQrPreset.name;
  document.getElementById('qrAddress').textContent = currentQrPreset.addr;
  document.getElementById('qrUnitPrice').textContent = `${currentQrPreset.rate.toFixed(1)} E2 / kWh`;
  document.getElementById('qrOrigin').textContent = currentQrPreset.origin;
  updateQrSummary();
  showToast(`QRコードを読み取りました：${currentQrPreset.name}`, 'cyan');
}

function setQrKwh(val) {
  document.getElementById('qrKwhSlider').value = val;
  updateQrSummary();
}

function updateQrSummary() {
  const kwh = parseFloat(document.getElementById('qrKwhSlider').value || 12);
  const totalE2 = Math.round(kwh * currentQrPreset.rate);
  document.getElementById('qrKwhVal').textContent = kwh.toFixed(1);
  document.getElementById('qrTotalE2').textContent = `${totalE2.toLocaleString('ja-JP')} E2`;
  const after = Math.max(0, Math.round(state.e2Balance - totalE2));
  document.getElementById('qrAfterBalance').textContent = `${after.toLocaleString('ja-JP')} E2`;
}

function confirmQrPayment() {
  const kwh = parseFloat(document.getElementById('qrKwhSlider').value || 12);
  const totalE2 = Math.round(kwh * currentQrPreset.rate);
  if (state.e2Balance < totalE2) {
    showToast('E2残高が不足しています。画面⑨から再エネE2を購入するかUSDTからスワップしてください。', 'amber');
    return;
  }
  state.e2Balance -= totalE2;
  addTransaction({
    counterparty: currentQrPreset.name,
    category: 'QR決済',
    direction: 'spend',
    kwh,
    e2: -totalE2,
    origin: currentQrPreset.origin
  });
  syncAllUI();
  showToast(`QR決済完了！ ${currentQrPreset.name} へ ${totalE2.toLocaleString('ja-JP')} E2（${kwh.toFixed(1)} kWh）を支払いました。`, 'emerald');
}

function renderMyQrSvg() {
  const wrap = document.getElementById('myQrSvgWrap');
  if (!wrap) return;
  // Crisp deterministic pseudo-QR SVG pattern
  const size = 21;
  let cells = '';
  const isFinder = (r, c) =>
    (r < 7 && c < 7) || (r < 7 && c >= size - 7) || (r >= size - 7 && c < 7);

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      let fill = false;
      if (isFinder(r, c)) {
        const lr = r < 7 ? r : r - (size - 7);
        const lc = c < 7 ? c : c - (size - 7);
        fill = lr === 0 || lr === 6 || lc === 0 || lc === 6 || (lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4);
      } else {
        fill = ((r * 17 + c * 31 + r * c * 7) % 11) < 5;
      }
      if (fill) {
        cells += `<rect x="${c * 8 + 4}" y="${r * 8 + 4}" width="8" height="8" rx="1.2" fill="#061326"/>`;
      }
    }
  }
  wrap.innerHTML = `<svg width="176" height="176" viewBox="0 0 176 176">${cells}</svg>`;
}

function copyMyWalletId() {
  if (navigator.clipboard) navigator.clipboard.writeText(state.did).catch(() => {});
  showToast(`ウォレットDID（${state.did}）をコピーしました。`, 'cyan');
}

function simulateReceiveViaQr() {
  state.e2Balance += 150;
  addTransaction({
    counterparty: '近隣EVユーザー（QR受給電）',
    category: 'QR受電・シェア',
    direction: 'gain',
    kwh: 5.0,
    e2: 150,
    origin: 'マイQRコード経由のローカル電力シェア'
  });
  syncAllUI();
  showToast('マイQR経由で +150 E2（5.0 kWh分）を受信しました！', 'emerald');
}

/* ==================== SCREEN 5: SUPERCONDUCTING GENERATOR ==================== */
function setGenMode(mode, btn) {
  state.generator.mode = mode;
  btn.parentElement.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  if (mode === 'rated') {
    state.generator.outputKw = 14.82;
    state.generator.efficiency = 98.4;
    state.generator.tempK = 77.2;
  } else if (mode === 'eco') {
    state.generator.outputKw = 8.40;
    state.generator.efficiency = 97.9;
    state.generator.tempK = 77.4;
  } else {
    state.generator.outputKw = 0.00;
    state.generator.efficiency = 0.0;
    state.generator.tempK = 78.1;
  }
  persistState();
  renderGeneratorUI();
  showToast(`超電導発電ユニットを「${mode === 'rated' ? '定格運転' : mode === 'eco' ? 'エコ運転' : '待機'}」に切り替えました。`);
}

function tickGenerator() {
  const g = state.generator;
  if (g.mode !== 'standby') {
    const base = g.mode === 'rated' ? 14.8 : 8.4;
    g.outputKw = Math.max(0, base + (Math.random() - 0.5) * 0.28);
    g.efficiency = Number((g.mode === 'rated' ? 98.4 + (Math.random() - 0.5) * 0.2 : 97.9 + (Math.random() - 0.5) * 0.2).toFixed(1));
    g.tempK = Number((77.2 + (Math.random() - 0.5) * 0.14).toFixed(1));
    const deltaKwh = g.outputKw / 3600 * 6; // slight visual tick
    g.totalKwh += deltaKwh;
    g.pendingE2 += deltaKwh * E2_PER_KWH;
  }
  if (state.currentScreen === 5) renderGeneratorUI();
}

function renderGeneratorUI() {
  const g = state.generator;
  document.getElementById('genOutputKw').textContent = g.outputKw.toFixed(2);
  document.getElementById('genUptime').textContent = g.uptime.toFixed(1);
  document.getElementById('genTotalKwh').textContent = g.totalKwh.toLocaleString('ja-JP', { maximumFractionDigits: 1 });
  document.getElementById('genEffVal').textContent = g.efficiency.toFixed(1);
  document.getElementById('genTempK').textContent = `${g.tempK.toFixed(1)} K`;
  document.getElementById('genPendingE2').textContent = g.pendingE2.toFixed(2);
  document.getElementById('genPendingKwh').textContent = (g.pendingE2 / E2_PER_KWH).toFixed(3);
  document.getElementById('genLifetimeE2').textContent = `${Math.round(g.lifetimeE2).toLocaleString('ja-JP')} E2`;

  const badge = document.getElementById('genStatusBadge');
  if (g.mode === 'standby') {
    badge.className = 'badge badge-amber';
    badge.innerHTML = '⏸ メンテナンス待機';
  } else {
    badge.className = 'badge badge-emerald';
    badge.innerHTML = '<span class="pulse-dot"></span>オンライン稼働中';
  }

  // Arc stroke-dashoffset (236 total length)
  const offset = 236 - (236 * Math.min(100, g.efficiency)) / 100;
  document.getElementById('genEffArc').setAttribute('stroke-dashoffset', offset.toFixed(1));

  // History list
  document.getElementById('genHistoryList').innerHTML = g.history.map(item => `
    <div class="tx-row" style="cursor:default;">
      <div class="tx-icon" style="background:var(--emerald-dim);color:var(--emerald-bright);">⚛️</div>
      <div class="tx-main">
        <div class="tx-title">${item.note}</div>
        <div class="tx-meta"><span>${item.time}</span><span>SCG-MK4-0042</span></div>
      </div>
      <div class="tx-amount mono">
        <div class="tx-e2 gain">+${Math.round(item.e2).toLocaleString('ja-JP')} E2</div>
        <div class="tx-kwh">+${item.kwh.toFixed(2)} kWh</div>
      </div>
    </div>
  `).join('');
}

function claimGeneratorE2() {
  const amount = Math.round(state.generator.pendingE2);
  if (amount < 1) {
    showToast('同期可能な未受取E2がまだありません。', 'amber');
    return;
  }
  const kwh = amount / E2_PER_KWH;
  state.e2Balance += amount;
  state.generator.lifetimeE2 += amount;
  state.generator.pendingE2 = 0;
  state.generator.history.unshift({
    time: 'たった今',
    kwh,
    e2: amount,
    note: '超電導発電 手動ウォレット同期'
  });
  addTransaction({
    counterparty: '超電導発電機 SCG-MK4-0042',
    category: '自動発電ミント',
    direction: 'gain',
    kwh,
    e2: amount,
    origin: `超電導源泉発電（${state.generator.tempK}K / 効率 ${state.generator.efficiency}%）`
  });
  syncAllUI();
  showToast(`超電導発電の自動生成分 +${amount} E2（${kwh.toFixed(2)} kWh）をウォレットへ同期しました！`, 'emerald');
}

function runGenDiagnostics() {
  showToast('SCG-MK4-0042 自己診断完了：超電導コイル・冷却系・スマートコントラクト署名モジュールすべて正常です。', 'emerald');
}

/* ==================== SCREEN 6: WALLET & TRANSACTION HISTORY ==================== */
let txFilter = 'all';

function setTxFilter(filter, btn) {
  txFilter = filter;
  btn.parentElement.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderTxList();
}

function renderTxList() {
  const listEl = document.getElementById('walletTxList');
  if (!listEl) return;
  const q = (document.getElementById('txSearchInput')?.value || '').trim().toLowerCase();

  const filtered = state.transactions.filter(tx => {
    if (txFilter === 'gain' && tx.direction !== 'gain') return false;
    if (txFilter === 'spend' && tx.direction !== 'spend') return false;
    if (q) {
      const hay = `${tx.counterparty} ${tx.category} ${tx.id} ${tx.hash}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  if (!filtered.length) {
    listEl.innerHTML = `<div style="text-align:center;padding:28px;color:var(--text-muted);font-size:0.85rem;">該当する取引履歴がありません。</div>`;
    return;
  }

  listEl.innerHTML = filtered.map(tx => {
    const isGain = tx.e2 >= 0;
    const iconBg = tx.category.includes('USDT') ? 'var(--cyan-dim)' : isGain ? 'var(--emerald-dim)' : 'var(--rose-dim)';
    const iconTxt = tx.category.includes('USDT') ? '⇄' : tx.category.includes('再エネ') ? '☀️' : tx.category.includes('V2V') ? '🔁' : tx.category.includes('QR') ? '📷' : '⚛️';
    return `
      <div class="tx-row" onclick="openTxModal('${tx.id}')">
        <div class="tx-icon" style="background:${iconBg};">${iconTxt}</div>
        <div class="tx-main">
          <div class="tx-title">${tx.counterparty}</div>
          <div class="tx-meta">
            <span>${tx.time}</span>
            <span class="badge badge-cyan" style="padding:1px 7px;font-size:0.65rem;">${tx.category}</span>
            <span class="mono" style="font-size:0.68rem;">${tx.id}</span>
          </div>
        </div>
        <div class="tx-amount mono">
          <div class="tx-e2 ${isGain ? 'gain' : 'spend'}">${isGain ? '+' : ''}${tx.e2.toLocaleString('ja-JP')} E2</div>
          <div class="tx-kwh">${tx.kwh.toFixed(2)} kWh${tx.usdtDelta ? ` (${tx.usdtDelta > 0 ? '+' : ''}${tx.usdtDelta.toFixed(2)} USDT)` : ''}</div>
        </div>
      </div>
    `;
  }).join('');
}

function openTxModal(txId) {
  const tx = state.transactions.find(t => t.id === txId);
  if (!tx) return;
  const isGain = tx.e2 >= 0;
  openModal(`スマートコントラクト取引詳細 (${tx.id})`, `
    <div class="stack-md">
      <div style="text-align:center;padding:14px;border-radius:14px;background:rgba(6,12,24,0.8);border:1px solid var(--border-strong);">
        <span class="badge badge-emerald" style="margin-bottom:6px;">✓ Verified on ESS Chain</span>
        <div class="mono" style="font-size:1.7rem;font-weight:900;color:${isGain ? 'var(--emerald-bright)' : 'var(--rose)'};">
          ${isGain ? '+' : ''}${tx.e2.toLocaleString('ja-JP')} E2
        </div>
        <div class="mono" style="font-size:0.82rem;color:var(--cyan);margin-top:2px;">換算電力量: ${tx.kwh.toFixed(2)} kWh</div>
      </div>
      <div class="ai-meter-box">
        <div class="detail-kv"><span class="detail-k">取引日時</span><span class="detail-v mono">${tx.time}</span></div>
        <div class="detail-kv"><span class="detail-k">相手先</span><span class="detail-v">${tx.counterparty}</span></div>
        <div class="detail-kv"><span class="detail-k">カテゴリ</span><span class="detail-v">${tx.category}</span></div>
        <div class="detail-kv"><span class="detail-k">エネルギー由来証明</span><span class="detail-v" style="color:var(--emerald-bright);">${tx.origin}</span></div>
        ${tx.usdtDelta ? `<div class="detail-kv"><span class="detail-k">USDT 変動</span><span class="detail-v mono">${tx.usdtDelta > 0 ? '+' : ''}${tx.usdtDelta.toFixed(2)} USDT</span></div>` : ''}
        <div class="detail-kv"><span class="detail-k">ブロック高</span><span class="detail-v mono">#${tx.block.toLocaleString('ja-JP')}</span></div>
        <div class="detail-kv"><span class="detail-k">ガス代</span><span class="detail-v mono" style="color:var(--emerald-bright);">0.00 E2</span></div>
        <div class="detail-kv"><span class="detail-k">Tx Hash</span><span class="detail-v mono" style="font-size:0.7rem;color:var(--cyan);">${tx.hash}</span></div>
      </div>
      <button class="btn btn-secondary btn-block" onclick="closeModal()">閉じる</button>
    </div>
  `);
}

/* ==================== SCREEN 7: ESS ECONOMIC INDICATORS ==================== */
let econRange = '24H';

function setEconRange(range, btn) {
  econRange = range;
  btn.parentElement.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  drawEconChart();
}

function drawEconChart() {
  const canvas = document.getElementById('econChartCanvas');
  if (!canvas) return;
  const rect = canvas.parentElement.getBoundingClientRect();
  if (rect.width < 10) return;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  const w = rect.width;
  const h = rect.height;
  const pad = { top: 20, right: 18, bottom: 28, left: 44 };
  const plotW = w - pad.left - pad.right;
  const plotH = h - pad.top - pad.bottom;

  const datasets = {
    '24H': {
      labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '現在'],
      supply: [42, 40, 58, 86, 74, 55, 62],
      demand: [35, 32, 54, 62, 68, 72, 56],
      circ:   [46, 46.2, 46.8, 47.6, 48.0, 48.3, 48.6]
    },
    '7D': {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      supply: [64, 71, 68, 75, 82, 79, 85],
      demand: [58, 61, 63, 64, 67, 59, 62],
      circ:   [45.2, 45.8, 46.3, 47.0, 47.5, 48.1, 48.6]
    },
    '30D': {
      labels: ['4週前', '3週前', '2週前', '1週前', '今週'],
      supply: [55, 62, 70, 78, 86],
      demand: [51, 56, 60, 64, 67],
      circ:   [41.0, 43.2, 45.1, 46.9, 48.6]
    }
  };
  const ds = datasets[econRange];
  ctx.clearRect(0, 0, w, h);

  ctx.strokeStyle = 'rgba(148,163,184,0.12)';
  ctx.font = '11px ui-monospace, SFMono-Regular, monospace';
  ctx.fillStyle = '#64748b';

  for (let v = 20; v <= 100; v += 20) {
    const y = pad.top + plotH - ((v - 20) / 80) * plotH;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(w - pad.right, y);
    ctx.stroke();
    ctx.fillText(`${v}`, 8, y + 4);
  }

  function drawLine(arr, color, minV, maxV, dashed = false) {
    const stepX = plotW / (arr.length - 1);
    ctx.save();
    if (dashed) ctx.setLineDash([5, 4]);
    ctx.beginPath();
    arr.forEach((v, i) => {
      const x = pad.left + i * stepX;
      const y = pad.top + plotH - ((v - minV) / (maxV - minV)) * plotH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.restore();

    arr.forEach((v, i) => {
      const x = pad.left + i * stepX;
      const y = pad.top + plotH - ((v - minV) / (maxV - minV)) * plotH;
      ctx.beginPath();
      ctx.arc(x, y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    });
  }

  drawLine(ds.supply, '#1ce89c', 20, 100);
  drawLine(ds.demand, '#fb7185', 20, 100);
  drawLine(ds.circ, '#22d3ee', 38, 52, true);

  const stepX = plotW / (ds.labels.length - 1);
  ctx.fillStyle = '#94a3b8';
  ds.labels.forEach((lbl, i) => {
    const x = pad.left + i * stepX;
    ctx.fillText(lbl, x - 14, h - 7);
  });
}

/* ==================== SCREEN 8: SETTINGS & PROFILE ==================== */
function saveSettings() {
  state.settings.autoMatch = document.getElementById('setAutoMatch').checked;
  state.settings.priceCap = parseFloat(document.getElementById('setPriceCap').value);
  state.settings.batteryAlert = document.getElementById('setBatteryAlert').checked;
  state.settings.socMin = parseInt(document.getElementById('setSocMin').value, 10);
  state.settings.bioLock = document.getElementById('setBioLock').checked;
  state.settings.autoV2h = document.getElementById('setAutoV2h').checked;

  document.getElementById('setPriceCapVal').textContent = state.settings.priceCap.toFixed(1);
  document.getElementById('setSocMinVal').textContent = state.settings.socMin;
  persistState();
}

function addDemoIotDevice() {
  const pool = [
    { icon: '🔋', name: '家庭用定置蓄電池 ESS-Wall 13.5', type: '蓄電ユニット', meta: 'SOC 91% • 自動充放電' },
    { icon: '☀️', name: '屋根上太陽光パネル 6.4kW', type: 'PVインバータ', meta: '発電中 4.1 kW' },
    { icon: '🌡️', name: 'スマートエコキュート IoT', type: 'デマンドレスポンス', meta: '余剰時自動沸上ON' }
  ];
  const pick = pool[state.devices.length % pool.length];
  state.devices.push({
    id: 'iot-' + Date.now(),
    icon: pick.icon,
    name: pick.name,
    type: pick.type,
    status: 'connected',
    meta: pick.meta
  });
  persistState();
  renderDeviceLists();
  showToast(`新規デバイス「${pick.name}」をESSウォレットへ連携しました！`, 'emerald');
}

function openInfoModal(kind) {
  const map = {
    terms: ['利用規約・電気本位制プロトコル規約', 'E2ポイントは認証された物理電力量（1 kWh = 30 E2）を価値の裏付けとするエネルギー利用権トークンです。V2V・QR・再エネ直販のすべての決済はESSスマートコントラクトにより即時執行されます。'],
    privacy: ['プライバシー・暗号鍵管理', '秘密鍵は端末のSecure Enclave（生体認証保護領域）にのみ保存され、サーバーには送信されません。'],
    faq: ['よくある質問（FAQ）', 'Q. 停電時もE2で電力シェアできますか？\nA. はい。ローカルV2Vおよび近距離QRオフライン署名モードにより、インターネット遮断時でもEV・マイクログリッド間で電力融通が可能です。'],
    whitepaper: ['ESS 電気本位制ホワイトペーパー要約', '法定通貨のインフレや中央集権的な送電コストから解放された「超電導発電＋再エネ＋EV分散蓄電」による自律循環型エネルギー経済圏の設計思想を定義しています。']
  };
  const [title, body] = map[kind] || map.terms;
  openModal(title, `
    <div class="stack-md">
      <p style="font-size:0.86rem;color:var(--text-secondary);white-space:pre-line;line-height:1.7;">${body}</p>
      <button class="btn btn-secondary btn-block" onclick="closeModal()">閉じる</button>
    </div>
  `);
}

/* ==================== SCREEN 9: RENEWABLE MARKET & USDT SWAP ==================== */
let swapDirection = 'e2_to_usdt'; // 'e2_to_usdt' | 'usdt_to_e2'

function setMarketTab(tab) {
  document.getElementById('mktTabBuy').classList.toggle('active', tab === 'buy');
  document.getElementById('mktTabSwap').classList.toggle('active', tab === 'swap');
  document.getElementById('mktTabBoth').classList.toggle('active', tab === 'both');

  const grid = document.getElementById('marketMainGrid');
  const buyEl = document.getElementById('marketBuySection');
  const swapEl = document.getElementById('marketSwapSection');

  if (tab === 'buy') {
    buyEl.style.display = '';
    swapEl.style.display = 'none';
    grid.style.gridTemplateColumns = '1fr';
  } else if (tab === 'swap') {
    buyEl.style.display = 'none';
    swapEl.style.display = '';
    grid.style.gridTemplateColumns = '1fr';
  } else {
    buyEl.style.display = '';
    swapEl.style.display = '';
    grid.style.gridTemplateColumns = '';
  }
}

function renderSolarPlants() {
  const wrap = document.getElementById('solarPlantList');
  if (!wrap) return;
  wrap.innerHTML = state.solarPlants.map(p => {
    const isSel = p.id === state.selectedPlantId;
    return `
      <div class="plant-card ${isSel ? 'selected' : ''}" onclick="selectSolarPlant('${p.id}')">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
          <div>
            <div style="font-size:0.86rem;font-weight:800;color:#fff;">${p.name}</div>
            <div style="font-size:0.72rem;color:var(--text-secondary);margin-top:2px;">📍 ${p.region} • ${p.type}</div>
          </div>
          <span class="badge badge-emerald mono">${p.availKwh} kWh 余剰</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;font-size:0.74rem;">
          <span style="color:var(--emerald-bright);">🌿 ${p.cert}</span>
          <span class="mono" style="color:var(--cyan);font-weight:700;">${p.e2PerKwh} E2/kWh (${p.usdtPerKwh.toFixed(2)} USDT)</span>
        </div>
      </div>
    `;
  }).join('');
}

function selectSolarPlant(id) {
  state.selectedPlantId = id;
  renderSolarPlants();
  updateBuyPreview();
}

function updateBuyPreview() {
  const plant = state.solarPlants.find(p => p.id === state.selectedPlantId) || state.solarPlants[0];
  const slider = document.getElementById('buyKwhSlider');
  slider.max = Math.max(10, plant.availKwh);
  if (parseFloat(slider.value) > plant.availKwh) slider.value = plant.availKwh;

  const kwh = parseFloat(slider.value || 100);
  const e2 = Math.round(kwh * plant.e2PerKwh);
  const usdtCost = kwh * plant.usdtPerKwh;
  const payMethod = document.getElementById('buyPayMethod').value;

  document.getElementById('selectedPlantName').textContent = plant.name;
  document.getElementById('selectedPlantAvail').textContent = plant.availKwh;
  document.getElementById('buyKwhDisplay').textContent = kwh.toLocaleString('ja-JP');
  document.getElementById('buyE2Display').textContent = e2.toLocaleString('ja-JP');
  document.getElementById('buyCostDisplay').textContent =
    payMethod === 'usdt'
      ? `${usdtCost.toFixed(2)} USDT`
      : `¥${Math.round(usdtCost * 150).toLocaleString('ja-JP')}（デモ決済）`;
}

function executeRenewablePurchase() {
  const plant = state.solarPlants.find(p => p.id === state.selectedPlantId) || state.solarPlants[0];
  const kwh = parseFloat(document.getElementById('buyKwhSlider').value || 100);
  if (kwh <= 0 || kwh > plant.availKwh) {
    showToast('購入可能な余剰電力量を超えています。', 'amber');
    return;
  }
  const e2 = Math.round(kwh * plant.e2PerKwh);
  const usdtCost = kwh * plant.usdtPerKwh;
  const payMethod = document.getElementById('buyPayMethod').value;

  if (payMethod === 'usdt') {
    if (state.usdtBalance < usdtCost) {
      showToast(`USDT残高（${state.usdtBalance.toFixed(2)} USDT）が不足しています。E2からUSDTへスワップするかカード決済をお選びください。`, 'amber');
      return;
    }
    state.usdtBalance = Number((state.usdtBalance - usdtCost).toFixed(2));
  }

  plant.availKwh = Math.max(0, plant.availKwh - kwh);
  state.e2Balance += e2;
  state.greenKwhTotal += kwh;
  state.v2hReflectedKwh += kwh;

  addTransaction({
    counterparty: plant.name,
    category: '再エネ購入',
    direction: 'gain',
    kwh,
    e2,
    usdtDelta: payMethod === 'usdt' ? -usdtCost : 0,
    origin: `${plant.cert}（自宅V2H即時反映）`
  });

  syncAllUI();
  showToast(`☀️ ${plant.name} から ${kwh} kWh（+${e2.toLocaleString('ja-JP')} E2）を購入し、グリーン証書とV2Hへ反映しました！`, 'emerald');
}

function syncHomeV2h() {
  const badge = document.getElementById('v2hSyncStatus');
  badge.textContent = '同期中...';
  setTimeout(() => {
    state.v2hReflectedKwh = state.e2Balance / E2_PER_KWH;
    badge.textContent = '同期済 ✓';
    syncAllUI();
    showToast('自宅スマートメーター・V2Hへ最新の再エネE2電力利用権を同期しました。', 'emerald');
  }, 500);
}

// USDT Bidirectional Swap
function flipSwapDirection() {
  swapDirection = swapDirection === 'e2_to_usdt' ? 'usdt_to_e2' : 'e2_to_usdt';
  const input = document.getElementById('swapFromInput');
  input.value = swapDirection === 'e2_to_usdt' ? '3000' : '20';
  updateSwapCalc();
}

function setSwapPct(pct) {
  const maxVal = swapDirection === 'e2_to_usdt' ? state.e2Balance : state.usdtBalance;
  const val = swapDirection === 'e2_to_usdt' ? Math.floor(maxVal * pct) : Number((maxVal * pct).toFixed(2));
  document.getElementById('swapFromInput').value = val;
  updateSwapCalc();
}

function updateSwapCalc() {
  const fromVal = parseFloat(document.getElementById('swapFromInput').value) || 0;
  const isE2ToUsdt = swapDirection === 'e2_to_usdt';

  document.getElementById('swapFromToken').textContent = isE2ToUsdt ? 'E2' : 'USDT';
  document.getElementById('swapFromToken').className = `badge ${isE2ToUsdt ? 'badge-emerald' : 'badge-cyan'} mono`;
  document.getElementById('swapToToken').textContent = isE2ToUsdt ? 'USDT' : 'E2';
  document.getElementById('swapToToken').className = `badge ${isE2ToUsdt ? 'badge-cyan' : 'badge-emerald'} mono`;

  document.getElementById('swapFromBalance').textContent = isE2ToUsdt
    ? `${Math.round(state.e2Balance).toLocaleString('ja-JP')} E2`
    : `${state.usdtBalance.toFixed(2)} USDT`;
  document.getElementById('swapToBalance').textContent = isE2ToUsdt
    ? `${state.usdtBalance.toFixed(2)} USDT`
    : `${Math.round(state.e2Balance).toLocaleString('ja-JP')} E2`;

  let toVal = 0;
  let kwhEquiv = 0;
  if (isE2ToUsdt) {
    toVal = fromVal / state.usdtRateE2;
    kwhEquiv = fromVal / E2_PER_KWH;
    document.getElementById('swapToOutput').value = toVal.toFixed(2);
    document.getElementById('swapRateDetail').textContent = `${Math.round(fromVal).toLocaleString('ja-JP')} E2 ⇄ ${toVal.toFixed(2)} USDT`;
  } else {
    toVal = Math.round(fromVal * state.usdtRateE2);
    kwhEquiv = toVal / E2_PER_KWH;
    document.getElementById('swapToOutput').value = toVal.toLocaleString('ja-JP');
    document.getElementById('swapRateDetail').textContent = `${fromVal.toFixed(2)} USDT ⇄ ${toVal.toLocaleString('ja-JP')} E2`;
  }
  document.getElementById('swapKwhEquiv').textContent = `${kwhEquiv.toFixed(2)} kWh 相当`;
  document.getElementById('swapLiveRateBadge').textContent = `${state.usdtRateE2} E2 = 1.00 USDT`;
}

function executeUsdtSwap() {
  const fromVal = parseFloat(document.getElementById('swapFromInput').value) || 0;
  if (fromVal <= 0) {
    showToast('交換数量を入力してください。', 'amber');
    return;
  }

  if (swapDirection === 'e2_to_usdt') {
    if (state.e2Balance < fromVal) {
      showToast('保有E2ポイントが不足しています。', 'amber');
      return;
    }
    const usdtOut = Number((fromVal / state.usdtRateE2).toFixed(2));
    state.e2Balance -= fromVal;
    state.usdtBalance = Number((state.usdtBalance + usdtOut).toFixed(2));
    addTransaction({
      counterparty: 'ESS ⇄ USDT 流動性プール',
      category: 'USDTスワップ',
      direction: 'spend',
      kwh: fromVal / E2_PER_KWH,
      e2: -fromVal,
      usdtDelta: usdtOut,
      origin: `E2 → USDT 即時スワップ（レート ${state.usdtRateE2} E2/USDT）`
    });
    syncAllUI();
    showToast(`⇄ スワップ完了！ ${Math.round(fromVal).toLocaleString('ja-JP')} E2 → +${usdtOut.toFixed(2)} USDT に交換しました。`, 'emerald');
  } else {
    if (state.usdtBalance < fromVal) {
      showToast('保有USDT残高が不足しています。', 'amber');
      return;
    }
    const e2Out = Math.round(fromVal * state.usdtRateE2);
    state.usdtBalance = Number((state.usdtBalance - fromVal).toFixed(2));
    state.e2Balance += e2Out;
    addTransaction({
      counterparty: 'ESS ⇄ USDT 流動性プール',
      category: 'USDTスワップ',
      direction: 'gain',
      kwh: e2Out / E2_PER_KWH,
      e2: e2Out,
      usdtDelta: -fromVal,
      origin: `USDT → E2 即時スワップ（レート ${state.usdtRateE2} E2/USDT）`
    });
    syncAllUI();
    showToast(`⇄ スワップ完了！ ${fromVal.toFixed(2)} USDT → +${e2Out.toLocaleString('ja-JP')} E2 に交換しました。`, 'emerald');
  }
}

/* ==================== CLOCK & INITIALIZATION ==================== */
function updateMobileClock() {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const el = document.getElementById('mobileClock');
  if (el) el.textContent = `${hh}:${mm}`;
}

window.addEventListener('resize', () => {
  if (state.currentScreen === 2) drawDashWaveChart();
  if (state.currentScreen === 7) drawEconChart();
});

// Boot
renderMyQrSvg();
renderV2vMap();
syncAllUI();
setMarketTab('both');
navigateTo(state.currentScreen || 2);
updateMobileClock();

setInterval(() => {
  tickDashWave();
  tickGenerator();
  updateMobileClock();
}, 1200);
