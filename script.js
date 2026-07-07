const game = {
  started: false,
  round: 1,
  maxRound: 30,
  position: 0,
  money: 1200000,
  reputation: 350,
  happiness: 80,
  xp: 350,
  land: 3,
  crops: 5,
  loan: 200000
};

const nodes = [
  { name: "台北", x: 58, y: 18, type: "city", icon: "城" },
  { name: "桃園", x: 49, y: 25, type: "farm", icon: "田" },
  { name: "新竹", x: 45, y: 34, type: "chance", icon: "?" },
  { name: "台中", x: 42, y: 45, type: "city", icon: "市" },
  { name: "嘉義", x: 50, y: 55, type: "farm", icon: "稻" },
  { name: "台南", x: 38, y: 62, type: "fate", icon: "!" },
  { name: "高雄", x: 35, y: 76, type: "city", icon: "港" },
  { name: "屏東", x: 48, y: 82, type: "weather", icon: "風" },
  { name: "台東", x: 63, y: 70, type: "chance", icon: "?" },
  { name: "花蓮", x: 70, y: 53, type: "farm", icon: "牧" },
  { name: "宜蘭", x: 69, y: 36, type: "weather", icon: "雨" },
  { name: "基隆", x: 63, y: 23, type: "fate", icon: "!" }
];

const chanceCards = [
  {
    title: "政府補助",
    icon: "補",
    desc: "你的智慧灌溉計畫獲得補助，現金增加。",
    money: 200000,
    reputation: 12,
    xp: 45,
    effect: "資金 +200,000，聲望 +12"
  },
  {
    title: "農產品展售會",
    icon: "展",
    desc: "在市集打開知名度，品牌被更多人看見。",
    money: 120000,
    reputation: 18,
    xp: 35,
    effect: "資金 +120,000，聲望 +18"
  },
  {
    title: "智慧農機升級",
    icon: "機",
    desc: "投資 AI 感測設備，短期花費提高，長期口碑提升。",
    money: -80000,
    reputation: 25,
    happiness: 3,
    xp: 55,
    effect: "資金 -80,000，聲望 +25，幸福度 +3"
  }
];

const fateCards = [
  {
    title: "颱風來襲",
    icon: "颱",
    desc: "強風影響收成，需要緊急修復農場設施。",
    money: -160000,
    happiness: -6,
    xp: 25,
    effect: "資金 -160,000，幸福度 -6"
  },
  {
    title: "市場價格下跌",
    icon: "跌",
    desc: "本回合農產品售價下滑，現金流受到壓力。",
    money: -90000,
    reputation: -8,
    effect: "資金 -90,000，聲望 -8"
  },
  {
    title: "病蟲害爆發",
    icon: "蟲",
    desc: "作物健康受損，必須導入 AI 植保建議。",
    money: -70000,
    happiness: -4,
    xp: 30,
    effect: "資金 -70,000，幸福度 -4"
  }
];

const farmEvents = [
  {
    title: "豐收季",
    desc: "氣候穩定、管理得宜，農場迎來漂亮收成。",
    money: 150000,
    reputation: 14,
    happiness: 4,
    xp: 40,
    effect: "資金 +150,000，聲望 +14，幸福度 +4"
  },
  {
    title: "契作成功",
    desc: "與在地餐廳完成契作，提高穩定收入。",
    money: 110000,
    reputation: 10,
    xp: 35,
    effect: "資金 +110,000，聲望 +10"
  },
  {
    title: "設備維護",
    desc: "溫室與感測器需要保養，花費一些預算換取穩定。",
    money: -50000,
    happiness: 2,
    xp: 20,
    effect: "資金 -50,000，幸福度 +2"
  }
];

const weatherEvents = [
  {
    title: "梅雨鋒面",
    desc: "連日降雨讓部分農地積水，AI 建議調整排水。",
    money: -60000,
    reputation: 6,
    happiness: -3,
    xp: 30,
    effect: "資金 -60,000，聲望 +6，幸福度 -3"
  },
  {
    title: "陽光充足",
    desc: "晴朗天氣讓作物長勢良好，農場效率提升。",
    money: 90000,
    happiness: 5,
    xp: 25,
    effect: "資金 +90,000，幸福度 +5"
  },
  {
    title: "寒流警報",
    desc: "氣溫驟降，溫室加溫成本增加。",
    money: -85000,
    happiness: -2,
    xp: 20,
    effect: "資金 -85,000，幸福度 -2"
  }
];

const aiTips = [
  "資金低於 80 萬時，先保留現金，不要急著擴張土地。",
  "聲望越高，越容易拿到補助與契作機會。",
  "幸福度下降會影響結算評價，遇到天災後記得穩住員工與社區關係。",
  "農場格通常比較穩定，機會卡和命運卡則波動較大。",
  "貸款不是壞事，但回合後段要注意現金流。"
];

const mapEl = document.getElementById("taiwanMap");
const routePath = document.getElementById("routePath");
const rollBtn = document.getElementById("rollBtn");
const diceFace = document.getElementById("diceFace");
const diceText = document.getElementById("diceText");
const token = document.createElement("div");
token.className = "player-token";
token.textContent = "農";

function formatMoney(value) {
  return Math.max(0, Math.round(value)).toLocaleString("zh-TW");
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function drawRoute() {
  const first = nodes[0];
  const commands = nodes
    .map((node, index) => `${index === 0 ? "M" : "L"} ${node.x} ${node.y}`)
    .join(" ");
  routePath.setAttribute("d", `${commands} L ${first.x} ${first.y}`);
}

function initMap() {
  drawRoute();
  document.querySelectorAll(".map-node").forEach((node) => node.remove());

  nodes.forEach((node, index) => {
    const el = document.createElement("button");
    el.type = "button";
    el.className = `map-node ${node.type}`;
    el.style.left = `${node.x}%`;
    el.style.top = `${node.y}%`;
    el.innerHTML = `${node.icon}<span class="node-label">${node.name}</span>`;
    el.setAttribute("aria-label", `${node.name} ${node.type}`);
    el.addEventListener("click", () => showNodeInfo(node));
    mapEl.appendChild(el);
  });

  mapEl.appendChild(token);
  moveToken(false);
}

function moveToken(animated = true) {
  const node = nodes[game.position];
  token.style.left = `${node.x}%`;
  token.style.top = `${node.y}%`;

  document.querySelectorAll(".map-node").forEach((el, index) => {
    el.classList.toggle("active", index === game.position);
  });

  if (animated) {
    token.classList.remove("hopping");
    void token.offsetWidth;
    token.classList.add("hopping");
  }
}

function updateUI() {
  game.money = Math.max(0, game.money);
  game.reputation = Math.max(0, game.reputation);
  game.happiness = clamp(game.happiness, 0, 100);
  game.xp = clamp(game.xp, 0, 1000);

  document.getElementById("money").textContent = formatMoney(game.money);
  document.getElementById("reputation").textContent = game.reputation.toLocaleString("zh-TW");
  document.getElementById("happiness").textContent = `${game.happiness}%`;
  document.getElementById("round").textContent = game.round;
  document.getElementById("assetCash").textContent = formatMoney(game.money);
  document.getElementById("assetLand").textContent = `${game.land} 筆`;
  document.getElementById("assetCrops").textContent = `${game.crops} 種`;
  document.getElementById("assetLoan").textContent = formatMoney(game.loan);
  document.getElementById("xpBar").style.width = `${game.xp / 10}%`;
  document.getElementById("xpText").textContent = `${game.xp} / 1000`;
}

function setEvent(card) {
  document.getElementById("eventTitle").textContent = card.title;
  document.getElementById("eventDesc").textContent = card.desc;
  document.getElementById("eventEffect").textContent = card.effect;
}

function applyEvent(card) {
  game.money += card.money || 0;
  game.reputation += card.reputation || 0;
  game.happiness += card.happiness || 0;
  game.xp += card.xp || 0;
  setEvent(card);
  updateUI();
  document.getElementById("aiAdvice").textContent = pick(aiTips);
}

function triggerCurrentNode() {
  const node = nodes[game.position];
  let card;

  if (node.type === "chance") {
    card = pick(chanceCards);
  } else if (node.type === "fate") {
    card = pick(fateCards);
  } else if (node.type === "weather") {
    card = pick(weatherEvents);
  } else {
    card = pick(farmEvents);
  }

  applyEvent({
    ...card,
    title: `${node.name}｜${card.title}`,
    desc: `你抵達 ${node.name}。${card.desc}`
  });
}

function rollDice() {
  if (!game.started || game.round > game.maxRound) return;

  const dice = Math.floor(Math.random() * 6) + 1;
  diceFace.textContent = dice;
  diceText.textContent = `前進 ${dice} 步`;
  rollBtn.disabled = true;

  let steps = 0;
  const timer = window.setInterval(() => {
    game.position = (game.position + 1) % nodes.length;
    moveToken();
    steps += 1;

    if (steps >= dice) {
      window.clearInterval(timer);
      triggerCurrentNode();
      game.round += 1;

      if (game.round > game.maxRound) {
        finishGame();
      } else {
        rollBtn.disabled = false;
      }
      updateUI();
    }
  }, 360);
}

function startGame() {
  if (game.started) return;
  game.started = true;
  rollBtn.disabled = false;
  diceText.textContent = "今天可擲骰，祝你豐收！";
  setEvent({
    title: "遊戲開始",
    desc: "擲骰後角色會沿著臺灣路線移動，落點會觸發對應事件。",
    effect: "目標：30 回合內讓農場又富又受歡迎"
  });
}

function finishGame() {
  game.started = false;
  rollBtn.disabled = true;
  const score = game.money / 10000 + game.reputation * 2 + game.happiness * 10 - game.loan / 20000;
  const rank = score >= 900 ? "智慧農業之星" : score >= 650 ? "穩健農場主" : "努力型青農";
  setEvent({
    title: "遊戲結束",
    desc: `你的最終資金為 ${formatMoney(game.money)}，聲望 ${game.reputation}，幸福度 ${game.happiness}%。`,
    effect: `結算稱號：${rank}`
  });
  diceText.textContent = "已完成 30 回合";
}

function resetGame() {
  Object.assign(game, {
    started: false,
    round: 1,
    maxRound: 30,
    position: 0,
    money: 1200000,
    reputation: 350,
    happiness: 80,
    xp: 350,
    land: 3,
    crops: 5,
    loan: 200000
  });
  diceFace.textContent = "?";
  diceText.textContent = "點擊開始遊戲後可擲骰";
  rollBtn.disabled = true;
  setEvent({
    title: "等待開局",
    desc: "按下開始遊戲，擲骰後會依照落點觸發機會卡、命運卡、農場事件或氣象事件。",
    effect: "準備經營你的農業王國"
  });
  document.getElementById("aiAdvice").textContent = aiTips[0];
  moveToken(false);
  updateUI();
}

function renderMiniCards() {
  const chanceList = document.getElementById("chanceCardList");
  const fateList = document.getElementById("fateCardList");
  chanceList.innerHTML = "";
  fateList.innerHTML = "";

  chanceCards.forEach((card) => {
    const el = document.createElement("div");
    el.className = "mini-card";
    el.innerHTML = `<span>${card.icon}</span>${card.title}`;
    chanceList.appendChild(el);
  });

  fateCards.forEach((card) => {
    const el = document.createElement("div");
    el.className = "mini-card";
    el.innerHTML = `<span>${card.icon}</span>${card.title}`;
    fateList.appendChild(el);
  });
}

function showDialog(title, body) {
  const dialog = document.getElementById("infoDialog");
  document.getElementById("dialogTitle").textContent = title;
  document.getElementById("dialogBody").textContent = body;

  if (typeof dialog.showModal === "function") {
    dialog.showModal();
  } else {
    window.alert(`${title}\n\n${body}`);
  }
}

function showNodeInfo(node) {
  showDialog(
    node.name,
    `這是 ${node.name} 節點，類型為「${translateType(node.type)}」。擲骰停在這裡時會觸發相關事件。`
  );
}

function translateType(type) {
  const labels = {
    city: "城市",
    chance: "機會",
    fate: "命運",
    farm: "農場",
    weather: "氣象"
  };
  return labels[type] || type;
}

document.getElementById("startBtn").addEventListener("click", startGame);
rollBtn.addEventListener("click", rollDice);
document.getElementById("resetBtn").addEventListener("click", resetGame);
document.getElementById("guideBtn").addEventListener("click", () => {
  showDialog("遊戲說明", "按開始遊戲後擲骰，角色會沿著臺灣地圖節點前進。城市與農場多半帶來收益，機會卡可能帶來補助，命運卡與氣象事件則會考驗你的經營策略。");
});
document.getElementById("characterBtn").addEventListener("click", () => {
  showDialog("選擇角色", "目前角色為阿澤青農。這個版本先保留單一角色，之後可擴充不同技能的農夫、研究員與行銷專家。");
});
document.getElementById("mapBtn").addEventListener("click", () => {
  showDialog("臺灣地圖", "路線從北部出發，經過西部農業區、南部港都、東部縱谷與東北氣象區。點擊地圖節點可查看類型。");
});

initMap();
renderMiniCards();
updateUI();
