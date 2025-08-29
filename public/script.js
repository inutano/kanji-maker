class KanjiGame {
  constructor() {
    this.kanjiData = [];
    this.currentQuestion = 0;
    this.correctAnswers = 0;
    this.totalQuestions = 10;
    this.selectedLeftRadical = null;
    this.selectedRightRadical = null;
    this.currentKanji = null;

    this.init();
  }

  async init() {
    try {
      await this.loadKanjiData();
      this.setupEventListeners();
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
      .getElementById("restart-game")
      .addEventListener("click", () => this.startNewGame());
  }

  startNewGame() {
    this.currentQuestion = 0;
    this.correctAnswers = 0;
    this.selectedLeftRadical = null;
    this.selectedRightRadical = null;

    // Hide completion modal
    document.getElementById("completion-modal").style.display = "none";

    // Reset UI
    this.updateScoreBoard();
    this.updateProgressBar();

    this.generateNewQuestion();
  }

  generateNewQuestion() {
    // Select a random kanji for the current question
    const randomIndex = Math.floor(Math.random() * this.kanjiData.length);
    this.currentKanji = this.kanjiData[randomIndex];

    // Update question display
    document.getElementById("current-reading").textContent =
      this.currentKanji.reading;
    document.getElementById("current-meaning").textContent =
      this.currentKanji.meaning;

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
    document.getElementById("hint-message").style.display = "none";

    // Update question counter
    document.getElementById("total-count").textContent =
      this.currentQuestion + 1;
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
    const correctRadicals = this.currentKanji.radicals;
    const isCorrect =
      correctRadicals.includes(this.selectedLeftRadical) &&
      correctRadicals.includes(this.selectedRightRadical);

    const resultMessage = document.getElementById("result-message");
    const messageContent = resultMessage.querySelector(".message-content");

    if (isCorrect) {
      this.correctAnswers++;
      resultMessage.className = "result-message correct";
      messageContent.innerHTML = `
                <div>🎉 正解！</div>
                <div>「${this.currentKanji.kanji}」（${this.currentKanji.reading}）</div>
                <div>${this.currentKanji.meaning}</div>
            `;

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

    this.updateScoreBoard();

    // Show next question button or complete game
    if (this.currentQuestion < this.totalQuestions - 1) {
      document.getElementById("next-question").style.display = "inline-block";
    } else {
      this.completeGame();
    }
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
    const hintMessage = document.getElementById("hint-message");
    const hintContent = hintMessage.querySelector(".hint-content");

    hintContent.innerHTML = `
            <div>💡 ヒント</div>
            <div>正しい漢字は「${this.currentKanji.kanji}」です</div>
            <div>必要な部首: ${this.currentKanji.radicals.join(" と ")}</div>
        `;

    hintMessage.style.display = "block";
  }

  nextQuestion() {
    this.currentQuestion++;
    this.updateProgressBar();
    this.generateNewQuestion();
  }

  updateScoreBoard() {
    document.getElementById("correct-count").textContent = this.correctAnswers;
  }

  updateProgressBar() {
    const progressPercentage =
      (this.currentQuestion / this.totalQuestions) * 100;
    document.getElementById("progress-fill").style.width =
      `${progressPercentage}%`;
    document.getElementById("progress-text").textContent =
      `${this.currentQuestion} / ${this.totalQuestions} 問題完了`;
  }

  completeGame() {
    const accuracy = Math.round(
      (this.correctAnswers / this.totalQuestions) * 100,
    );

    document.getElementById("final-score").textContent = this.correctAnswers;
    document.getElementById("final-total").textContent = this.totalQuestions;
    document.getElementById("accuracy").textContent = `${accuracy}%`;

    // Show completion modal after a short delay
    setTimeout(() => {
      document.getElementById("completion-modal").style.display = "flex";
    }, 2000);
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
