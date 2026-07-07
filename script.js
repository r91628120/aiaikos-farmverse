const game = {
  started: false,
  round: 1,
  maxRound: 30,
  position: 0,
  money: 1200000,
  yield: 0,
  sustain: 50,
  happy: 80,
  xp: 0
};

const nodes = [
  { name: '台北花卉', x: 59, y: 13, type: 'city', icon: '🌺' },
  { name: '桃園溫室', x: 48, y: 22, type: 'farm', icon: '🥬' },
  { name: '機會', x: 55, y: 31, type: 'chance', icon: '?' },
  { name: '台中稻米', x: 42, y: 42, type: 'city', icon: '🌾' },
  { name: '嘉義雜糧', x: 52, y: 55, type: 'farm', icon: '🌽' },
  { name: '命運', x: 46, y: 66, type: 'fate', icon: '!' },
  { name: '台南芒果', x: 35, y: 68, type: 'city', icon: '🥭' },
  { name: '高雄農港', x: 31, y: 81, type: 'chance', icon: '?' },
  { name: '屏東熱帶果園', x: 51, y: 84, type: 'farm', icon: '🍌' },
  { name: '台東有機', x: 64, y: 70, type: 'city', icon: '🌱' },
  { name: '花蓮休閒農場', x: 69, y: 52, type: 'weather', icon: '🌦' },
  { name: '宜蘭蔥田', x: 66, y: 29, type: 'fate', icon: '!' }
];

const chanceCards = [
  { title: '🎁 政府補助通過', desc: '你的智慧農業設備補助申請通過！', money: 200000, xp: 12, effect: '資金 +200,000' },
  { title: '🛒 農產品上架電商', desc: '品牌曝光提升，訂單變多。', money: 120000, xp: 10, effect: '資金 +120,000，經驗 +10' },
  { title: '💧 導入智慧灌溉', desc: '節水又降低管理成本。', sustain: 8, money: -80000, xp: 15, effect: '永續 +8，投資 -80,000' },
  { title: '🎪 農夫市集爆紅', desc: '遊客大排隊，農場人氣上升。', money: 160000, happy: 5, xp: 14, effect: '資金 +160,000，幸福度 +5' }
];

const fateCards = [
  { title: '🌪 颱風來襲', desc: '若沒有防災設備，作物受損。', money: -180000, happy: -5, effect: '資金 -180,000，幸福度 -5' },
  { title: '🦠 病蟲害爆發', desc: '請前往 AI植物保護學院判斷防治策略。', money: -90000, yield: -8, effect: '資金 -90,000，產量 -8' },
  { title: '📉 市場價格下跌', desc: '本回合收入受到影響。', money: -120000, effect: '資金 -120,000' },
  { title: '🔥 高溫熱害', desc: '請啟動 AI農業氣象教練判斷灌溉與遮陰策略。', money: -70000, sustain: -3, effect: '資金 -70,000，永續 -3' }
];

const farmEvents = [
  { title: '🌾 豐收季節', desc: '這塊土地管理良好，作物順利收成。', money: 140000, yield: 15, xp: 10, effect: '資金 +140,000，產量 +15' },
  { title: '🚜 設備維修', desc: '農機需要保養，短期支出增加。', money: -60000, xp: 4, effect: '資金 -60,000' },
  { title: '🌱 友善耕作加分', desc: '消費者支持度提升。', sustain: 5, happy: 3, xp: 8, effect: '永續 +5，幸福度 +3' }
];

const aiTips = [
  '資金低於 50 萬時，先不要擴張土地，保留現金流比較安全。',
  '遇到高溫或豪雨事件時，可以先使用 AI農業氣象教練做農事判斷。',
  '病蟲害不是看到就噴藥，要先確認作物、發生程度與天氣條件。',
  '智慧設備前期花錢，但能降低後續成本與災害風險。',
  '農場經營不是只追求獲利，永續、品牌與幸福度也會影響最後評價。'
];

const mapEl = document.getElementById('taiwanMap');
const token = document.createElement('div');
token.className = 'player-token';
token.textContent = '👨‍🌾';

function initMap() {
  mapEl.innerHTML = '';
  const decors = [
    ['🐄', 64, 18], ['🏡', 39, 36], ['🌻', 56, 48], ['🐳', 80, 55], ['⛵', 22, 28],
    ['🌳', 38, 18], ['🏖', 70, 86], ['🍍', 58, 76], ['☁️', 18, 12], ['☁️', 78, 18]
  ];
  decors.forEach(([emoji, x, y]) => {
    const d = document.createElement('div');
    d.className = 'decor';
    d.textContent = emoji;
    d.style.left = `${x}%`;
    d.style.top = `${y}%`;
    mapEl.appendChild(d);
  });

  nodes.forEach((n, i) => {
    const node = document.createElement('div');
    node.className = `path-node ${n.type}`;
    node.style.left = `${n.x}%`;
    node.style.top = `${n.y}%`;
    node.innerHTML = `${n.icon}<span class="node-label">${n.name}</span>`;
    mapEl.appendChild(node);
  });
  mapEl.appendChild(token);
  moveToken();
}

function moveToken() {
  const n = nodes[game.position];
  token.style.left = `${n.x}%`;
  token.style.top = `${n.y}%`;
}

function formatMoney(num) {
  return Math.max(0, Math.round(num)).toLocaleString('zh-TW');
}

function updateUI() {
  document.getElementById('money').textContent = formatMoney(game.money);
  document.getElementById('yield').textContent = game.yield;
  document.getElementById('sustain').textContent = game.sustain;
  document.getElementById('happy').textContent = `${game.happy}%`;
  document.getElementById('round').textContent = game.round;
  document.getElementById('xpText').textContent = `經驗值 ${game.xp} / 100`;
  document.getElementById('xpBar').style.width = `${Math.min(100, game.xp)}%`;
}

function addLog(text) {
  const li = document.createElement('li');
  li.textContent = text;
  const list = document.getElementById('logList');
  list.prepend(li);
}

function applyCard(card) {
  game.money += card.money || 0;
  game.yield += card.yield || 0;
  game.sustain += card.sustain || 0;
  game.happy += card.happy || 0;
  game.xp += card.xp || 0;
  game.money = Math.max(0, game.money);
  game.yield = Math.max(0, game.yield);
  game.sustain = Math.max(0, Math.min(100, game.sustain));
  game.happy = Math.max(0, Math.min(100, game.happy));

  document.getElementById('cardTitle').textContent = card.title;
  document.getElementById('cardDesc').textContent = card.desc;
  document.getElementById('cardEffect').textContent = card.effect;
  addLog(`${card.title}：${card.effect}`);
  updateUI();
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function triggerNode() {
  const node = nodes[game.position];
  if (node.type === 'chance') applyCard(pick(chanceCards));
  else if (node.type === 'fate') applyCard(pick(fateCards));
  else if (node.type === 'farm' || node.type === 'city') applyCard(pick(farmEvents));
  else if (node.type === 'weather') applyCard({
    title: '🌦 AI農業氣象教練提醒',
    desc: '今日風速偏高，植保機噴灑需延後，避免藥劑漂移。',
    money: -30000,
    sustain: 3,
    xp: 12,
    effect: '等待適合天氣，資金 -30,000，永續 +3'
  });
}

function rollDice() {
  if (!game.started || game.round > game.maxRound) return;
  const dice = Math.floor(Math.random() * 6) + 1;
  document.getElementById('dice').textContent = dice;
  document.getElementById('diceText').textContent = `前進 ${dice} 格！`;
  game.position = (game.position + dice) % nodes.length;
  moveToken();
  setTimeout(triggerNode, 420);
  game.round += 1;
  updateUI();

  if (game.round > game.maxRound) {
    document.getElementById('rollBtn').disabled = true;
    document.getElementById('cardTitle').textContent = '🏆 遊戲結算';
    document.getElementById('cardDesc').textContent = `你的最終資金為 ${formatMoney(game.money)}，永續 ${game.sustain}，幸福度 ${game.happy}%。`;
    document.getElementById('cardEffect').textContent = game.money >= 1500000 ? '恭喜成為智慧農業經營王！' : '完成青農挑戰，下一輪可以更強！';
  }
}

function startGame() {
  game.started = true;
  document.getElementById('rollBtn').disabled = false;
  document.getElementById('diceText').textContent = '輪到你擲骰！';
  document.getElementById('cardTitle').textContent = '🌱 青農創業開始';
  document.getElementById('cardDesc').textContent = '你獲得第一筆青年從農資金，準備踏上臺灣農業經營旅程。';
  document.getElementById('cardEffect').textContent = '目標：30回合內打造穩定又永續的農業王國';
  addLog('遊戲開始：阿澤青農踏上臺灣農業經營旅程。');
}

function resetGame() {
  Object.assign(game, { started:false, round:1, maxRound:30, position:0, money:1200000, yield:0, sustain:50, happy:80, xp:0 });
  document.getElementById('rollBtn').disabled = true;
  document.getElementById('dice').textContent = '?';
  document.getElementById('diceText').textContent = '按下開始遊戲';
  document.getElementById('cardTitle').textContent = '📜 今日事件';
  document.getElementById('cardDesc').textContent = '遊戲開始後，走到不同地點會觸發機會卡、命運卡與農業事件。';
  document.getElementById('cardEffect').textContent = '等待任務開始';
  document.getElementById('logList').innerHTML = '';
  document.getElementById('aiAdvice').textContent = aiTips[0];
  moveToken();
  updateUI();
}

function showAiAdvice() {
  const tip = pick(aiTips);
  document.getElementById('aiAdvice').textContent = tip;
  addLog(`AI小幫手：${tip}`);
}

document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('rollBtn').addEventListener('click', rollDice);
document.getElementById('aiBtn').addEventListener('click', showAiAdvice);
document.getElementById('resetBtn').addEventListener('click', resetGame);

initMap();
updateUI();
