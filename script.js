class KanjiGame {
  constructor() {
    this.kanjiData = [];
    this.selectedLeftRadical = null;
    this.selectedRightRadical = null;
    this.currentKanji = null;
    this.learnedKanji = new Set();
    this.hintCount = 0;
    this.speedRecords = {};
    this.startTime = null;
    this.currentTime = 0;
    this.isTimerRunning = false;
    this.timerInterval = null;
    this.sessionStats = {
      attempted: new Set(),
      correct: new Set(),
    };

    this.init();
  }

  async init() {
    try {
      await this.loadKanjiData();
      this.loadProgress();
      this.setupEventListeners();
      this.updateAchievementDisplay();
      this.startNewGame();
    } catch (error) {
      console.error("Failed to initialize game:", error);
      this.showError("ゲームの初期化に失敗しました。");
    }
  }

  async loadKanjiData() {
    try {
      const response = await fetch("./data/grade3_kanji.json");
      if (!response.ok) {
        throw new Error("Failed to load kanji data");
      }
      const data = await response.json();
      this.kanjiData = data.grade3_kanji;
    } catch (error) {
      // Fallback data in case the JSON file can't be loaded
      this.kanjiData = [
        {
          kanji: "安",
          reading: "やすい",
          meaning: "peaceful, cheap",
          radicals: ["宀", "女"],
        },
        {
          kanji: "医",
          reading: "いしゃ",
          meaning: "doctor",
          radicals: ["匚", "矢"],
        },
        {
          kanji: "泳",
          reading: "およぐ",
          meaning: "swim",
          radicals: ["氵", "永"],
        },
        {
          kanji: "化",
          reading: "かわる",
          meaning: "change",
          radicals: ["亻", "匕"],
        },
        {
          kanji: "開",
          reading: "ひらく",
          meaning: "open",
          radicals: ["門", "幵"],
        },
        {
          kanji: "球",
          reading: "たま",
          meaning: "ball",
          radicals: ["王", "求"],
        },
        {
          kanji: "銀",
          reading: "ぎん",
          meaning: "silver",
          radicals: ["金", "艮"],
        },
        {
          kanji: "使",
          reading: "つかう",
          meaning: "use",
          radicals: ["亻", "史"],
        },
        {
          kanji: "持",
          reading: "もつ",
          meaning: "hold",
          radicals: ["扌", "寺"],
        },
        {
          kanji: "取",
          reading: "とる",
          meaning: "take",
          radicals: ["耳", "又"],
        },
      ];
    }
  }

  loadProgress() {
    const saved = localStorage.getItem("kanji-maker-progress");
    if (saved) {
      try {
        const progress = JSON.parse(saved);
        this.learnedKanji = new Set(progress.learnedKanji || []);
        this.hintCount = progress.hintCount || 0;
        this.speedRecords = progress.speedRecords || {};
      } catch (error) {
        console.error("Failed to load progress:", error);
        this.learnedKanji = new Set();
        this.hintCount = 0;
        this.speedRecords = {};
      }
    }
  }

  saveProgress() {
    const progress = {
      learnedKanji: Array.from(this.learnedKanji),
      hintCount: this.hintCount,
      speedRecords: this.speedRecords,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem("kanji-maker-progress", JSON.stringify(progress));
  }

  resetProgress() {
    if (
      confirm(
        "学習記録をリセットしますか？\nこれまでの進捗がすべて削除されます。",
      )
    ) {
      this.learnedKanji.clear();
      this.hintCount = 0;
      this.speedRecords = {};
      localStorage.removeItem("kanji-maker-progress");
      this.updateAchievementDisplay();
      this.updateSpeedRanking();
      this.showMessage("学習記録をリセットしました！", "info");
    }
  }

  updateAchievementDisplay() {
    const totalKanji = this.kanjiData.length;
    const learnedCount = this.learnedKanji.size;
    const achievementPercentage = Math.round((learnedCount / totalKanji) * 100);

    // Update achievement stats
    document.getElementById("learned-count").textContent = learnedCount;
    document.getElementById("total-kanji-count").textContent = totalKanji;
    document.getElementById("achievement-percentage").textContent =
      `${achievementPercentage}%`;

    // Update achievement progress bar
    document.getElementById("achievement-fill").style.width =
      `${achievementPercentage}%`;

    // Update hint count
    document.getElementById("hint-count").textContent = this.hintCount;

    // Update achievement badge
    const badge = document.getElementById("achievement-badge");
    if (achievementPercentage === 100) {
      badge.textContent = "🏆 完全制覇！";
      badge.className = "achievement-badge complete";
    } else if (achievementPercentage >= 80) {
      badge.textContent = "🌟 上級者";
      badge.className = "achievement-badge advanced";
    } else if (achievementPercentage >= 50) {
      badge.textContent = "📚 中級者";
      badge.className = "achievement-badge intermediate";
    } else if (achievementPercentage >= 20) {
      badge.textContent = "🌱 初級者";
      badge.className = "achievement-badge beginner";
    } else {
      badge.textContent = "✨ スタート";
      badge.className = "achievement-badge starter";
    }

    // Check for complete achievement
    if (learnedCount === totalKanji && learnedCount > 0) {
      this.showCompleteAchievement();
    }
  }

  showCompleteAchievement() {
    setTimeout(() => {
      const modal = document.getElementById("complete-achievement-modal");
      modal.style.display = "flex";

      // Add confetti animation
      this.createConfetti();
    }, 1000);
  }

  createConfetti() {
    const colors = [
      "#ff6b6b",
      "#4ecdc4",
      "#45b7d1",
      "#96ceb4",
      "#ffeaa7",
      "#dda0dd",
    ];
    const confettiContainer = document.createElement("div");
    confettiContainer.id = "confetti-container";
    confettiContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
    `;
    document.body.appendChild(confettiContainer);

    for (let i = 0; i < 100; i++) {
      const confetti = document.createElement("div");
      confetti.style.cssText = `
        position: absolute;
        width: 10px;
        height: 10px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        top: -10px;
        left: ${Math.random() * 100}%;
        animation: confetti-fall ${2 + Math.random() * 3}s linear forwards;
        transform: rotate(${Math.random() * 360}deg);
      `;
      confettiContainer.appendChild(confetti);
    }

    // Remove confetti after animation
    setTimeout(() => {
      document.body.removeChild(confettiContainer);
    }, 5000);
  }

  startTimer() {
    this.startTime = Date.now();
    this.currentTime = 0;
    this.isTimerRunning = true;

    // Update display immediately
    this.updateTimeDisplay();

    // Start interval for live updates
    this.timerInterval = setInterval(() => {
      if (this.isTimerRunning) {
        this.currentTime = (Date.now() - this.startTime) / 1000;
        this.updateTimeDisplay();
      }
    }, 100);
  }

  stopTimer() {
    this.isTimerRunning = false;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    return this.currentTime;
  }

  updateTimeDisplay() {
    const timeElement = document.getElementById("current-time");
    const statusElement = document.getElementById("time-status");

    if (!this.isTimerRunning && this.currentTime === 0) {
      timeElement.textContent = "0.0秒";
      statusElement.textContent = "問題開始でタイマーが始まります";
      statusElement.className = "time-status";
      return;
    }

    timeElement.textContent = `${this.currentTime.toFixed(1)}秒`;

    if (this.isTimerRunning) {
      statusElement.textContent = "解答中...";
      statusElement.className = "time-status";
    } else {
      // Show status after answer
      const kanji = this.currentKanji.kanji;
      const currentRecord = this.speedRecords[kanji];

      if (!currentRecord || this.currentTime < currentRecord.time) {
        statusElement.textContent = "🏆 新記録！";
        statusElement.className = "time-status record";
      } else if (this.currentTime < 5) {
        statusElement.textContent = "⚡ とても早い！";
        statusElement.className = "time-status fast";
      } else if (this.currentTime < 10) {
        statusElement.textContent = "👍 いいペース";
        statusElement.className = "time-status";
      } else {
        statusElement.textContent = "🐌 ゆっくり考えよう";
        statusElement.className = "time-status slow";
      }
    }
  }

  updateSpeedRecord(kanji, time, reading) {
    const currentRecord = this.speedRecords[kanji];

    if (!currentRecord || time < currentRecord.time) {
      this.speedRecords[kanji] = {
        time: time,
        reading: reading,
        date: new Date().toISOString(),
      };
      this.saveProgress();
      this.updateSpeedRanking();
      return true; // New record
    }
    return false;
  }

  updateSpeedRanking() {
    const rankingList = document.getElementById("speed-ranking-list");

    // Convert records to array and sort by time
    const sortedRecords = Object.entries(this.speedRecords)
      .map(([kanji, record]) => ({
        kanji: kanji,
        time: record.time,
        reading: record.reading,
        date: record.date,
      }))
      .sort((a, b) => a.time - b.time)
      .slice(0, 10); // Top 10

    if (sortedRecords.length === 0) {
      rankingList.innerHTML = `
        <div class="no-records">
          まだ記録がありません<br/>
          頑張って問題を解いてみよう！
        </div>
      `;
      return;
    }

    rankingList.innerHTML = sortedRecords
      .map((record, index) => {
        const rankClass = index < 3 ? `rank-${index + 1}` : "";
        return `
          <div class="ranking-item ${rankClass}">
            <span class="rank-number">${index + 1}</span>
            <span class="ranking-kanji">${record.kanji}</span>
            <div class="ranking-info">
              <div class="ranking-reading">${record.reading}</div>
              <div class="ranking-time">${record.time.toFixed(1)}秒</div>
            </div>
          </div>
        `;
      })
      .join("");
  }

  setupEventListeners() {
    document
      .getElementById("check-answer")
      .addEventListener("click", () => this.checkAnswer());
    document
      .getElementById("hint-button")
      .addEventListener("click", () => this.showHint());
    document
      .getElementById("next-question")
      .addEventListener("click", () => this.nextQuestion());
    document
      .getElementById("new-game")
      .addEventListener("click", () => this.startNewGame());
    document
      .getElementById("reset-progress")
      .addEventListener("click", () => this.resetProgress());
    document
      .getElementById("close-complete-modal")
      .addEventListener("click", () => {
        document.getElementById("complete-achievement-modal").style.display =
          "none";
      });
    document
      .getElementById("continue-learning")
      .addEventListener("click", () => {
        document.getElementById("complete-achievement-modal").style.display =
          "none";
        this.generateNewQuestion();
      });
    document
      .getElementById("close-hint-modal")
      .addEventListener("click", () => {
        document.getElementById("hint-modal").style.display = "none";
      });
    document.getElementById("close-hint").addEventListener("click", () => {
      document.getElementById("hint-modal").style.display = "none";
    });
  }

  startNewGame() {
    this.selectedLeftRadical = null;
    this.selectedRightRadical = null;
    this.sessionStats.attempted.clear();
    this.sessionStats.correct.clear();

    // Hide modals
    document.getElementById("complete-achievement-modal").style.display =
      "none";

    // Reset UI
    this.updateAchievementDisplay();
    this.updateSpeedRanking();

    this.generateNewQuestion();
  }

  selectQuestionKanji() {
    // Get unlearned kanji first
    const unlearnedKanji = this.kanjiData.filter(
      (kanji) => !this.learnedKanji.has(kanji.kanji),
    );

    // If all kanji are learned, select from all kanji
    const candidateKanji =
      unlearnedKanji.length > 0 ? unlearnedKanji : this.kanjiData;

    // Avoid recently attempted kanji in this session when possible
    const notAttempted = candidateKanji.filter(
      (kanji) => !this.sessionStats.attempted.has(kanji.kanji),
    );
    const finalCandidates =
      notAttempted.length > 0 ? notAttempted : candidateKanji;

    const randomIndex = Math.floor(Math.random() * finalCandidates.length);
    return finalCandidates[randomIndex];
  }

  generateNewQuestion() {
    // Select kanji prioritizing unlearned ones
    this.currentKanji = this.selectQuestionKanji();
    this.sessionStats.attempted.add(this.currentKanji.kanji);

    // Update question display
    document.getElementById("current-reading").textContent =
      this.currentKanji.reading;
    document.getElementById("current-meaning").textContent =
      this.currentKanji.meaning;

    // Show learning status
    const isLearned = this.learnedKanji.has(this.currentKanji.kanji);
    const statusElement = document.getElementById("kanji-status");
    if (isLearned) {
      statusElement.textContent = "✅ 学習済み";
      statusElement.className = "kanji-status learned";
    } else {
      statusElement.textContent = "🆕 未学習";
      statusElement.className = "kanji-status unlearned";
    }

    // Clear previous selections
    this.selectedLeftRadical = null;
    this.selectedRightRadical = null;
    document.getElementById("left-radical").textContent = "";
    document.getElementById("right-radical").textContent = "";
    document.getElementById("result-kanji").textContent = "?";

    // Generate radical options
    this.generateRadicalOptions();

    // Reset buttons and messages
    document.getElementById("check-answer").disabled = true;
    document.getElementById("next-question").style.display = "none";
    document.getElementById("result-message").style.display = "none";
    document.getElementById("hint-modal").style.display = "none";

    // Start timer for new question
    this.startTimer();
  }

  generateRadicalOptions() {
    const correctRadicals = this.currentKanji.radicals;

    // Generate additional radical options (distractors)
    const allRadicals = [
      "氵",
      "亻",
      "扌",
      "木",
      "艹",
      "口",
      "日",
      "月",
      "土",
      "金",
      "石",
      "火",
      "心",
      "糸",
      "言",
      "食",
      "車",
      "馬",
      "門",
      "宀",
      "广",
      "辶",
      "阝",
      "竹",
      "示",
      "疒",
      "衣",
      "攵",
      "刂",
      "儿",
      "又",
      "力",
      "刀",
      "戈",
      "斤",
      "方",
      "比",
      "毛",
      "氏",
      "爪",
      "父",
      "爻",
      "片",
      "牙",
      "瓦",
      "甘",
      "用",
      "田",
      "由",
      "甲",
      "申",
      "白",
      "皮",
      "皿",
      "目",
      "矛",
      "矢",
      "知",
      "禾",
      "穴",
      "立",
      "竜",
      "糸",
      "缶",
      "网",
      "羊",
      "羽",
      "老",
      "而",
      "耒",
      "耳",
      "聿",
      "肉",
      "臣",
      "自",
      "至",
      "臼",
      "舌",
      "舛",
      "舟",
      "艮",
      "色",
      "艸",
      "虍",
      "虫",
      "血",
      "行",
      "衣",
      "襾",
    ];

    // Create options for left radical (hen)
    const leftOptions = [...correctRadicals];
    while (leftOptions.length < 6) {
      const randomRadical =
        allRadicals[Math.floor(Math.random() * allRadicals.length)];
      if (!leftOptions.includes(randomRadical)) {
        leftOptions.push(randomRadical);
      }
    }

    // Create options for right radical (tsukuri)
    const rightOptions = [...correctRadicals];
    while (rightOptions.length < 6) {
      const randomRadical =
        allRadicals[Math.floor(Math.random() * allRadicals.length)];
      if (!rightOptions.includes(randomRadical)) {
        rightOptions.push(randomRadical);
      }
    }

    // Shuffle arrays
    this.shuffleArray(leftOptions);
    this.shuffleArray(rightOptions);

    // Render options
    this.renderRadicalOptions("left-options", leftOptions, "left");
    this.renderRadicalOptions("right-options", rightOptions, "right");
  }

  renderRadicalOptions(containerId, options, side) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    options.forEach((radical) => {
      const option = document.createElement("div");
      option.className = "radical-option";
      option.textContent = radical;
      option.dataset.radical = radical;
      option.dataset.side = side;

      option.addEventListener("click", () =>
        this.selectRadical(option, radical, side),
      );

      container.appendChild(option);
    });
  }

  selectRadical(element, radical, side) {
    // Remove previous selection for this side
    const sideOptions = document.querySelectorAll(`[data-side="${side}"]`);
    sideOptions.forEach((option) => option.classList.remove("selected"));

    // Select current option
    element.classList.add("selected");

    if (side === "left") {
      this.selectedLeftRadical = radical;
      document.getElementById("left-radical").textContent = radical;
    } else {
      this.selectedRightRadical = radical;
      document.getElementById("right-radical").textContent = radical;
    }

    // Update result kanji display
    if (this.selectedLeftRadical && this.selectedRightRadical) {
      document.getElementById("result-kanji").textContent =
        this.selectedLeftRadical + this.selectedRightRadical;
      document.getElementById("check-answer").disabled = false;
    }
  }

  checkAnswer() {
    // Stop timer and get final time
    const finalTime = this.stopTimer();

    const correctRadicals = this.currentKanji.radicals;
    const isCorrect =
      correctRadicals.includes(this.selectedLeftRadical) &&
      correctRadicals.includes(this.selectedRightRadical);

    const resultMessage = document.getElementById("result-message");
    const messageContent = resultMessage.querySelector(".message-content");

    if (isCorrect) {
      this.sessionStats.correct.add(this.currentKanji.kanji);

      // Mark as learned and update speed record
      const wasNewlyLearned = !this.learnedKanji.has(this.currentKanji.kanji);
      this.learnedKanji.add(this.currentKanji.kanji);

      // Check for new speed record
      const isNewRecord = this.updateSpeedRecord(
        this.currentKanji.kanji,
        finalTime,
        this.currentKanji.reading,
      );

      resultMessage.className = "result-message correct";
      let message = `
        <div>🎉 正解！ <span style="color: #48bb78;">(${finalTime.toFixed(1)}秒)</span></div>
        <div>「${this.currentKanji.kanji}」（${this.currentKanji.reading}）</div>
        <div>${this.currentKanji.meaning}</div>
      `;

      if (wasNewlyLearned) {
        message += `<div class="new-learning">✨ 新しく覚えました！</div>`;
      }

      if (isNewRecord) {
        message += `<div class="new-record">🏆 新記録達成！</div>`;
      }

      messageContent.innerHTML = message;

      // Add bounce animation
      document.getElementById("result-kanji").classList.add("bounce");
      setTimeout(() => {
        document.getElementById("result-kanji").classList.remove("bounce");
      }, 1000);

      // Update result kanji to show correct answer
      document.getElementById("result-kanji").textContent =
        this.currentKanji.kanji;

      // Highlight correct radicals
      this.highlightCorrectRadicals(correctRadicals);

      // Update achievement display
      this.updateAchievementDisplay();
    } else {
      resultMessage.className = "result-message incorrect";
      messageContent.innerHTML = `
        <div>❌ 残念！</div>
        <div>正解は「${this.currentKanji.kanji}」（${this.currentKanji.reading}）</div>
        <div>${this.currentKanji.meaning}</div>
        <div>正しい部首: ${correctRadicals.join(" + ")}</div>
      `;

      // Add shake animation
      document.getElementById("result-kanji").classList.add("shake");
      setTimeout(() => {
        document.getElementById("result-kanji").classList.remove("shake");
      }, 500);

      // Update result kanji to show correct answer
      document.getElementById("result-kanji").textContent =
        this.currentKanji.kanji;

      // Highlight correct and incorrect radicals
      this.highlightRadicals(correctRadicals);
    }

    resultMessage.style.display = "block";
    document.getElementById("check-answer").disabled = true;

    // Show next question button
    document.getElementById("next-question").style.display = "inline-block";
  }

  highlightCorrectRadicals(correctRadicals) {
    const allOptions = document.querySelectorAll(".radical-option");
    allOptions.forEach((option) => {
      if (correctRadicals.includes(option.dataset.radical)) {
        option.classList.add("correct");
      }
    });
  }

  highlightRadicals(correctRadicals) {
    const allOptions = document.querySelectorAll(".radical-option");
    allOptions.forEach((option) => {
      if (correctRadicals.includes(option.dataset.radical)) {
        option.classList.add("correct");
      } else if (option.classList.contains("selected")) {
        option.classList.add("incorrect");
      }
    });
  }

  showHint() {
    // Increment hint count
    this.hintCount++;
    this.saveProgress();
    this.updateAchievementDisplay();

    const hintContent = document.getElementById("hint-content");
    hintContent.innerHTML = `
      <div class="hint-kanji">正しい漢字は「<strong>${this.currentKanji.kanji}</strong>」です</div>
      <div class="hint-radicals">必要な部首: <strong>${this.currentKanji.radicals.join(" と ")}</strong></div>
      <div class="hint-meaning">意味: ${this.currentKanji.meaning}</div>
      <div class="hint-reading">読み: ${this.currentKanji.reading}</div>
    `;

    // Show hint modal
    document.getElementById("hint-modal").style.display = "flex";
  }

  nextQuestion() {
    // Reset timer display
    document.getElementById("current-time").textContent = "0.0秒";
    document.getElementById("time-status").textContent =
      "問題開始でタイマーが始まります";
    document.getElementById("time-status").className = "time-status";

    this.generateNewQuestion();
  }

  showMessage(message, type = "info") {
    const messageDiv = document.createElement("div");
    messageDiv.className = `floating-message ${type}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      border-radius: 8px;
      color: white;
      font-weight: 600;
      z-index: 10000;
      animation: slideInOut 3s ease-in-out forwards;
    `;

    if (type === "info") {
      messageDiv.style.background = "#4299e1";
    }

    document.body.appendChild(messageDiv);

    setTimeout(() => {
      document.body.removeChild(messageDiv);
    }, 3000);
  }

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  showError(message) {
    alert(message);
  }
}

// Initialize the game when the page loads
document.addEventListener("DOMContentLoaded", () => {
  new KanjiGame();
});
