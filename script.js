const diagnoseButton = document.getElementById("diagnose");
const resetButton = document.getElementById("reset");
const quiz = document.getElementById("quiz");
const result = document.getElementById("result");
const resultTitle = document.getElementById("result-title");
const resultText = document.getElementById("result-text");
const error = document.getElementById("error");

const resultMessages = {
  save: {
    title: "守りを固める慎重派",
    text: "安心を優先し、手元のお金を丁寧に管理する傾向があります。使う目的を決めておくと、守りながら楽しむ選択もしやすくなります。"
  },
  use: {
    title: "今を大切にする充実派",
    text: "経験や日々の満足を大事にする傾向があります。楽しむためのお金と、将来に残すお金を先に分けると管理しやすくなります。"
  },
  grow: {
    title: "未来を広げる成長派",
    text: "将来の選択肢を増やすことに関心がある傾向です。目的と期間を整理し、無理のない範囲で続ける視点が重要です。"
  }
};

diagnoseButton.addEventListener("click", () => {
  const answers = ["q1", "q2", "q3"].map((name) => {
    const selected = document.querySelector(`input[name="${name}"]:checked`);
    return selected ? selected.value : null;
  });

  if (answers.includes(null)) {
    error.textContent = "3問すべてに回答してください。";
    return;
  }

  error.textContent = "";
  const counts = answers.reduce((total, answer) => {
    total[answer] += 1;
    return total;
  }, { save: 0, use: 0, grow: 0 });

  const priority = ["save", "grow", "use"];
  const type = priority.reduce((best, current) =>
    counts[current] > counts[best] ? current : best
  );

  resultTitle.textContent = resultMessages[type].title;
  resultText.textContent = resultMessages[type].text;
  quiz.hidden = true;
  result.hidden = false;
  result.scrollIntoView({ behavior: "smooth", block: "center" });
});

resetButton.addEventListener("click", () => {
  document.querySelectorAll('input[type="radio"]').forEach((input) => {
    input.checked = false;
  });
  error.textContent = "";
  result.hidden = true;
  quiz.hidden = false;
  document.getElementById("page-title").scrollIntoView({ behavior: "smooth" });
});
