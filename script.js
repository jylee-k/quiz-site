let questions = [];
let currentQuestion = {};

async function loadQuestionsFromGoogleSheet() {
  const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSw4-vVtoNGbNoCl5C4JT3_ljKe8O9JmNAzb_8zWkpJorGq7rA3Hte_fn8J0IGkYa_qyEVbB5OEMK5k/pub?gid=0&single=true&output=csv'; 
  Papa.parse(sheetUrl, {
    download: true,
    header: true,
    complete: function(results) {
      questions = results.data;
      showRandomQuestion();
    },
    error: function(err) {
      console.error("PapaParse error:", err);
    }
  });
}

function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',');

  return lines.slice(1).map(line => {
    const values = line.split(',');
    const questionObj = {};
    headers.forEach((header, i) => {
      questionObj[header.trim()] = values[i]?.trim();
    });
    return questionObj;
  });
}

async function loadQuestions() {
  const res = await fetch("questions.json"); // adjust if stored elsewhere
  questions = await res.json();
  showRandomQuestion();
}

function showRandomQuestion() {
  const randomIndex = Math.floor(Math.random() * questions.length);
  currentQuestion = questions[randomIndex];
  displayQuestion(currentQuestion);
  document.getElementById("result").innerHTML = "";
}

function displayQuestion(question) {
  const container = document.getElementById("question-container");
  container.innerHTML = `<p><strong>문제:</strong> ${question.question}</p>`;

  if (question.image) {
    container.innerHTML += `<img src="${question.image}" alt="관련 이미지" style="max-width:100%;">`;
  }

  if (question.type === "tf") {
    ["TRUE", "FALSE"].forEach(option => {
      container.innerHTML += `
        <button class="option" onclick="checkAnswer('${option}')">${option === "TRUE" ? "O (맞음)" : "X (아님)"}</button>
      `;
    });
  } else if (question.type === "mcq") {
    question.options.forEach(opt => {
      container.innerHTML += `
        <button class="option" onclick="checkAnswer('${opt}')">${opt}</button>
      `;
    });
  } else if (question.type === "open") {
    container.innerHTML += `
      <input type="text" id="open-answer" placeholder="정답을 입력하세요">
      <button onclick="checkOpenAnswer()">제출</button>
    `;
  }
}

function checkAnswer(userAnswer) {
  const correct = currentQuestion.answer;
  const explanation = currentQuestion.explanation || "";
  const isCorrect = userAnswer === correct;
  const resultEl = document.getElementById("result");
  resultEl.innerHTML = `
    <p>${isCorrect ? "정답입니다! ✅" : `틀렸습니다 ❌ (정답: ${correct})`}</p>
    <p><strong>설명:</strong> ${explanation}</p>
  `;
}

function checkOpenAnswer() {
  const userInput = document.getElementById("open-answer").value.trim().toLowerCase();
  const correctAnswer = currentQuestion.answer.trim().toLowerCase();
  const explanation = currentQuestion.explanation || "";
  const resultEl = document.getElementById("result");
  const isCorrect = userInput === correctAnswer;

  resultEl.innerHTML = `
    <p>${isCorrect ? "정답입니다! ✅" : `틀렸습니다 ❌ (정답: ${currentQuestion.answer})`}</p>
    <p><strong>설명:</strong> ${explanation}</p>
  `;
}

document.getElementById("next-btn").addEventListener("click", showRandomQuestion);

// Load questions on page load
loadQuestionsFromGoogleSheet();
