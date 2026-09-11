const characters = [
  { folder: "butamin", name: "ブタミン" },
  { folder: "fukurin", name: "フクリン" },
  { folder: "kanepiyo", name: "カネピヨ" },
  { folder: "kokeshin", name: "コケシン" },
  { folder: "moneymask", name: "マネーマスク" },
  { folder: "monster", name: "モンスター" },
  { folder: "negiduck", name: "ネギダック" },
  { folder: "okame-hibachi", name: "オカメ火鉢" },
  { folder: "retrobo", name: "レトロボ" },
  { folder: "yusha", name: "勇者" }
];

const grid = document.querySelector("#character-grid");
const count = document.querySelector("#character-count");

const createCard = ({ folder, name }) => {
  const article = document.createElement("article");
  article.className = "character-card";

  const destination = `./${folder}/`;
  article.innerHTML = `
    <div class="character-preview" aria-hidden="true">
      <iframe src="${destination}" loading="lazy" tabindex="-1" title=""></iframe>
    </div>
    <div class="character-info">
      <h3 class="character-name">${name}</h3>
      <p class="character-path">/${folder}/</p>
    </div>
    <span class="arrow" aria-hidden="true">›</span>
    <a class="character-link" href="${destination}" aria-label="${name}の個別ページを見る"></a>
  `;

  return article;
};

characters.forEach((character) => {
  grid.appendChild(createCard(character));
});

count.textContent = `${characters.length} characters`;
