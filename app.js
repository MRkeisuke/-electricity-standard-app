/* ==========================================================================
   E2 / Electric Standard — シンプル版（1画面1操作・全10画面）
   基準レート: 1 kWh = 30 E2 | 3,000 E2 = 20.00 USDT (150 E2 = 1 USDT)
   ========================================================================== */

const E2_PER_KWH = 30;
const E2_PER_USDT = 150;
const KM_PER_KWH = 6;
const STORAGE_KEY = 'e2_simple_demo_v1';

const V2V_CARS = [
  { id: 'c1', name: 'Tesla Model Y', dist: '180m', rate: 30, availKwh: 32, x: 268, y: 74 },
  { id: 'c2', name: 'IONIQ 5', dist: '320m', rate: 28, availKwh: 45, x: 92, y: 84 },
  { id: 'c3', name: 'Nissan Leaf', dist: '450m', rate: 29, availKwh: 24, x: 256, y: 184 }
];

const QR_SAMPLES = [
  { name: '青山ソーラー急速スタンド', kwh: 10.0, e2: 300 },
  { name: 'カフェ・グリーン充電ポート', kwh: 5.0, e2: 150 },
  { name: '地域EVシェア（隣車）', kwh: 8.0, e2: 240 }
];

function defaultState() {
  return {
    screen: 1,
    e2: 4250,
    usdt: 150.0,
    genTodayE2: 486,
    genTotalKwh: 18420,
    selectedCarId: 'c1',
    qrIndex: 0,
    switches: { ev: true, gen: true, wallet: true, alert: true },
    history: [
      { date: '11/26 00:05', label: '再エネ購入（サンライズ太陽光）', delta: +3000 },
      { date: '11/25 18:10', label: 'V2V給電（Tesla Model Y）', delta: +240 },
      { date: '11/25 14:20', label: 'USDT交換（E2 → USDT）', delta: -1500 },
      { date: '11/25 10:45', label: 'QR決済（青山ソーラー）', delta: -300 }
    ]
  };
}

let state = loadState();
let swapDir = 'e2_to_usdt';
let v2vRunning = false;
let v2vTimer = null;
let v2vKwh = 0;
let v2vE2 = 0;

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return Object.assign(defaultState(), JSON.parse(raw));
  } catch (e) {}
  return defaultState();
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {}
}

function resetDemo() {
  stopV2vTimer();
  localStorage.removeItem(STORAGE_KEY);
  state = defaultState();
  renderAll();
  goScreen(1);
  toast('初期状態にリセットしました');
}

/* ==================== NAVIGATION ==================== */
function goScreen(num) {
  if (v2vRunning && num !== 4) {
    stopV2vTimer();
  }
  state.screen = num;
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(`screen-${num}`);
  if (el) el.classList.add('active');

  // Demo dropdown sync
  const sel = document.getElementById('demoScreenSelect');
  if (sel) sel.value = String(num);

  // Show bottom nav only on main 4 tabs (2, 8, 9, 10)
  const nav = document.getElementById('bottomNav');
  const mainTabs = [2, 8, 9, 10];
  nav.classList.toggle('hidden', !mainTabs.includes(num));

  document.querySelectorAll('.tab-item').forEach(btn => {
    btn.classList.toggle('active', Number(btn.dataset.tab) === num);
  });

  if (num === 3) renderV2vStep1();
  if (num === 5) updateBuyView();
  if (num === 6) updateSwapView();
  if (num === 7) renderQrConfirm();
  if (num === 9) renderHistory();
  saveState();
}

/* ==================== TOAST ==================== */
let toastTimer = null;
function toast(msg) {
  const box = document.getElementById('toastBox');
  box.textContent = msg;
  box.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => box.classList.remove('show'), 2600);
}

function formatNow() {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${d.getMonth() + 1}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function addHistory(label, delta) {
  state.history.unshift({ date: formatNow(), label, delta: Math.round(delta) });
  saveState();
}

/* ==================== RENDER ALL ==================== */
function renderAll() {
  // Home
  const kwh = state.e2 / E2_PER_KWH;
  const km = Math.round(kwh * KM_PER_KWH);
  document.getElementById('homeE2Val').textContent = Math.round(state.e2).toLocaleString('ja-JP');
  document.getElementById('homeEquivVal').textContent = `${kwh.toFixed(1)} kWh / 走行可能 約${km.toLocaleString('ja-JP')}km`;
  document.getElementById('homeUsdtSub').textContent = `${state.usdt.toFixed(2)} USDT`;

  // Generator
  document.getElementById('genTodayE2').textContent = Math.round(state.genTodayE2).toLocaleString('ja-JP');
  document.getElementById('genTotalKwh').textContent = Math.round(state.genTotalKwh).toLocaleString('ja-JP');

  // Switches
  document.getElementById('swEv').checked = state.switches.ev;
  document.getElementById('swGen').checked = state.switches.gen;
  document.getElementById('swWallet').checked = state.switches.wallet;
  document.getElementById('swAlert').checked = state.switches.alert;

  renderV2vStep1();
  updateBuyView();
  updateSwapView();
  renderQrConfirm();
  renderHistory();
}

/* ==================== ① LOGIN ==================== */
function doBiometricLogin() {
  const lbl = document.getElementById('bioLoginLabel');
  lbl.textContent = '認証中...';
  setTimeout(() => {
    lbl.textContent = '生体認証でログイン';
    goScreen(2);
    toast('ログインしました');
  }, 550);
}

function doNewSignup() {
  toast('新規アカウントを作成しました（デモ）');
  goScreen(2);
}

/* ==================== ③ V2V STEP 1 ==================== */
function renderV2vStep1() {
  const pins = document.getElementById('v2vCarPins');
  const car = V2V_CARS.find(c => c.id === state.selectedCarId) || V2V_CARS[0];

  pins.innerHTML = V2V_CARS.map(c => {
    const sel = c.id === car.id;
    return `
      <g class="car-pin" transform="translate(${c.x},${c.y})" onclick="selectCar('${c.id}')">
        ${sel ? `<circle r="24" fill="rgba(28,232,156,0.18)" stroke="#1ce89c" stroke-width="2"/>` : ''}
        <circle r="17" fill="#0e1d36" stroke="${sel ? '#1ce89c' : '#38bdf8'}" stroke-width="2"/>
        <text y="6" text-anchor="middle" font-size="16">🚗</text>
      </g>
    `;
  }).join('');

  document.getElementById('v2vCarCard').innerHTML = `
    <div style="font-size:1rem;font-weight:800;margin-bottom:10px;">🚗 ${car.name}</div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;text-align:center;">
      <div style="background:var(--bg-input);padding:10px 6px;border-radius:12px;">
        <div style="font-size:0.7rem;color:var(--text-sub);">距離</div>
        <div class="mono" style="font-size:0.95rem;font-weight:800;margin-top:2px;">${car.dist}</div>
      </div>
      <div style="background:var(--bg-input);padding:10px 6px;border-radius:12px;">
        <div style="font-size:0.7rem;color:var(--text-sub);">単価</div>
        <div class="mono" style="font-size:0.95rem;font-weight:800;color:var(--emerald);margin-top:2px;">${car.rate} E2</div>
      </div>
      <div style="background:var(--bg-input);padding:10px 6px;border-radius:12px;">
        <div style="font-size:0.7rem;color:var(--text-sub);">供給可能</div>
        <div class="mono" style="font-size:0.95rem;font-weight:800;color:var(--cyan);margin-top:2px;">${car.availKwh} kWh</div>
      </div>
    </div>
  `;
}

function selectCar(id) {
  state.selectedCarId = id;
  renderV2vStep1();
}

function connectSelectedCar() {
  const car = V2V_CARS.find(c => c.id === state.selectedCarId) || V2V_CARS[0];
  v2vKwh = 0;
  v2vE2 = 0;
  document.getElementById('v2vPeerNameSub').textContent = `接続相手：${car.name}`;
  document.getElementById('v2vLiveKwh').textContent = '0.00';
  document.getElementById('v2vLiveE2').textContent = '0';
  document.getElementById('v2vConnPill').innerHTML = '<span class="lamp-dot"></span>接続完了';
  const btn = document.getElementById('v2vActionBtn');
  btn.className = 'btn-main';
  btn.textContent = '開始する';
  goScreen(4);
}

/* ==================== ④ V2V STEP 2 ==================== */
function stopV2vTimer() {
  clearInterval(v2vTimer);
  v2vRunning = false;
}

function backFromV2vStep2() {
  stopV2vTimer();
  goScreen(3);
}

function toggleV2vRun() {
  const car = V2V_CARS.find(c => c.id === state.selectedCarId) || V2V_CARS[0];
  const btn = document.getElementById('v2vActionBtn');
  const pill = document.getElementById('v2vConnPill');

  if (!v2vRunning) {
    v2vRunning = true;
    btn.className = 'btn-main btn-danger';
    btn.textContent = '停止して決済する';
    pill.innerHTML = '<span class="lamp-dot"></span>送受電中...';

    v2vTimer = setInterval(() => {
      v2vKwh += 0.25;
      v2vE2 = Math.round(v2vKwh * car.rate);
      document.getElementById('v2vLiveKwh').textContent = v2vKwh.toFixed(2);
      document.getElementById('v2vLiveE2').textContent = `+${v2vE2.toLocaleString('ja-JP')}`;
    }, 450);
  } else {
    stopV2vTimer();
    const earned = Math.max(30, v2vE2);
    state.e2 += earned;
    addHistory(`V2V給電（${car.name}）`, earned);
    renderAll();
    goScreen(2);
    toast(`決済完了！ +${earned.toLocaleString('ja-JP')} E2 を獲得しました`);
  }
}

/* ==================== ⑤ BUY RENEWABLE ==================== */
function updateBuyView() {
  const kwh = Number(document.getElementById('buySlider').value || 100);
  const e2 = kwh * E2_PER_KWH;
  const usdt = e2 / E2_PER_USDT;
  document.getElementById('buyKwhTxt').textContent = kwh;
  document.getElementById('buyE2Txt').textContent = `${e2.toLocaleString('ja-JP')} E2`;
  document.getElementById('buyUsdtTxt').textContent = usdt.toFixed(2);
}

function confirmBuyRenewable() {
  const select = document.getElementById('plantSelect');
  const plantLabel = select.options[select.selectedIndex].text.split('（')[0];
  const kwh = Number(document.getElementById('buySlider').value || 100);
  const e2 = kwh * E2_PER_KWH;
  const usdtCost = e2 / E2_PER_USDT;

  if (state.usdt >= usdtCost) {
    state.usdt = Number((state.usdt - usdtCost).toFixed(2));
  }
  state.e2 += e2;
  addHistory(`再エネ購入（${plantLabel}）`, e2);
  renderAll();
  goScreen(2);
  toast(`${kwh} kWh（+${e2.toLocaleString('ja-JP')} E2）を購入しました`);
}

/* ==================== ⑥ USDT SWAP ==================== */
function setSwapDir(dir) {
  swapDir = dir;
  document.getElementById('swapDirE2').classList.toggle('active', dir === 'e2_to_usdt');
  document.getElementById('swapDirUsdt').classList.toggle('active', dir === 'usdt_to_e2');
  document.getElementById('swapAmountInput').value = dir === 'e2_to_usdt' ? '3000' : '20';
  updateSwapView();
}

function updateSwapView() {
  const val = parseFloat(document.getElementById('swapAmountInput').value) || 0;
  if (swapDir === 'e2_to_usdt') {
    document.getElementById('swapInputLabel').textContent = '交換する E2 数量';
    document.getElementById('swapAvailLabel').textContent = `残高: ${Math.round(state.e2).toLocaleString('ja-JP')} E2`;
    document.getElementById('swapReceiveTxt').textContent = `${(val / E2_PER_USDT).toFixed(2)} USDT`;
  } else {
    document.getElementById('swapInputLabel').textContent = '交換する USDT 数量';
    document.getElementById('swapAvailLabel').textContent = `残高: ${state.usdt.toFixed(2)} USDT`;
    document.getElementById('swapReceiveTxt').textContent = `${Math.round(val * E2_PER_USDT).toLocaleString('ja-JP')} E2`;
  }
}

function executeSwap() {
  const val = parseFloat(document.getElementById('swapAmountInput').value) || 0;
  if (val <= 0) {
    toast('数量を入力してください');
    return;
  }
  if (swapDir === 'e2_to_usdt') {
    if (state.e2 < val) {
      toast('E2 残高が不足しています');
      return;
    }
    const usdtOut = Number((val / E2_PER_USDT).toFixed(2));
    state.e2 -= val;
    state.usdt = Number((state.usdt + usdtOut).toFixed(2));
    addHistory('USDT交換（E2 → USDT）', -val);
    renderAll();
    goScreen(2);
    toast(`${Math.round(val).toLocaleString('ja-JP')} E2 を ${usdtOut.toFixed(2)} USDT に交換しました`);
  } else {
    if (state.usdt < val) {
      toast('USDT 残高が不足しています');
      return;
    }
    const e2Out = Math.round(val * E2_PER_USDT);
    state.usdt = Number((state.usdt - val).toFixed(2));
    state.e2 += e2Out;
    addHistory('USDT交換（USDT → E2）', e2Out);
    renderAll();
    goScreen(2);
    toast(`${val.toFixed(2)} USDT を +${e2Out.toLocaleString('ja-JP')} E2 に交換しました`);
  }
}

/* ==================== ⑦ QR PAYMENT ==================== */
function setQrMode(mode) {
  document.getElementById('qrModeScan').classList.toggle('active', mode === 'scan');
  document.getElementById('qrModeMine').classList.toggle('active', mode === 'mine');
  document.getElementById('qrScanArea').style.display = mode === 'scan' ? 'flex' : 'none';
  document.getElementById('qrMineArea').style.display = mode === 'mine' ? 'flex' : 'none';
}

function simulateQrScan() {
  state.qrIndex = (state.qrIndex + 1) % QR_SAMPLES.length;
  renderQrConfirm();
  const item = QR_SAMPLES[state.qrIndex];
  toast(`QRを読み取りました：${item.name}`);
}

function renderQrConfirm() {
  const item = QR_SAMPLES[state.qrIndex] || QR_SAMPLES[0];
  document.getElementById('qrTargetName').textContent = item.name;
  document.getElementById('qrTargetKwh').textContent = `${item.kwh.toFixed(1)} kWh`;
  document.getElementById('qrTargetE2').textContent = `${item.e2.toLocaleString('ja-JP')} E2`;
}

function confirmQrPay() {
  const item = QR_SAMPLES[state.qrIndex] || QR_SAMPLES[0];
  if (state.e2 < item.e2) {
    toast('E2 残高が不足しています');
    return;
  }
  state.e2 -= item.e2;
  addHistory(`QR決済（${item.name}）`, -item.e2);
  renderAll();
  goScreen(2);
  toast(`${item.name} へ ${item.e2} E2 を支払いました`);
}

function renderMyQr() {
  const box = document.getElementById('myQrContainer');
  const size = 19;
  let rects = '';
  const isFinder = (r, c) =>
    (r < 6 && c < 6) || (r < 6 && c >= size - 6) || (r >= size - 6 && c < 6);

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      let on = false;
      if (isFinder(r, c)) {
        const lr = r < 6 ? r : r - (size - 6);
        const lc = c < 6 ? c : c - (size - 6);
        on = lr === 0 || lr === 5 || lc === 0 || lc === 5 || (lr >= 2 && lr <= 3 && lc >= 2 && lc <= 3);
      } else {
        on = ((r * 13 + c * 29 + r * c * 5) % 9) < 4;
      }
      if (on) rects += `<rect x="${c * 9 + 4}" y="${r * 9 + 4}" width="8.5" height="8.5" rx="1.2" fill="#061224"/>`;
    }
  }
  box.innerHTML = `<svg width="178" height="178" viewBox="0 0 178 178">${rects}</svg>`;
}

/* ==================== ⑨ HISTORY ==================== */
function renderHistory() {
  const list = document.getElementById('historyList');
  list.innerHTML = state.history.map(item => {
    const plus = item.delta >= 0;
    return `
      <div class="history-item">
        <div>
          <div class="history-date mono">${item.date}</div>
          <div class="history-title">${item.label}</div>
        </div>
        <div class="history-delta mono ${plus ? 'plus' : 'minus'}">
          ${plus ? '+' : ''}${item.delta.toLocaleString('ja-JP')} E2
        </div>
      </div>
    `;
  }).join('');
}

/* ==================== ⑩ SETTINGS ==================== */
function saveSwitches() {
  state.switches = {
    ev: document.getElementById('swEv').checked,
    gen: document.getElementById('swGen').checked,
    wallet: document.getElementById('swWallet').checked,
    alert: document.getElementById('swAlert').checked
  };
  saveState();
  toast('設定を保存しました');
}

/* ==================== CLOCK & INIT ==================== */
function updateClock() {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  document.getElementById('clockText').textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

renderMyQr();
renderAll();
goScreen(state.screen || 1);
updateClock();
setInterval(updateClock, 15000);
