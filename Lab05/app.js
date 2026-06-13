// ============================================================
// Завдання 2 — GitHub-агрегатор
// ============================================================

const usernameInput = document.getElementById("username");
const loadBtn = document.getElementById("load");
const resultEl = document.getElementById("result");

let currentController = null;

loadBtn.addEventListener("click", loadGithubData);

async function loadGithubData() {
  const username = usernameInput.value.trim();

  // 1. Валідація username
  if (username === "") {
    renderError("Введіть GitHub username");
    return;
  }

  if (username.includes(" ")) {
    renderError("Username не повинен містити пробіли");
    return;
  }

  // 2. Якщо попередній запит ще виконується — скасовуємо його
  if (currentController) {
    currentController.abort();
  }

  currentController = new AbortController();

  // 3. Loading стан
  loadBtn.disabled = true;
  resultEl.textContent = "";

  const loadingText = document.createElement("p");
  loadingText.className = "status";
  loadingText.textContent = "Завантаження...";
  resultEl.appendChild(loadingText);

  const startTime = performance.now();

  try {
    const profileUrl = `https://api.github.com/users/${username}`;
    const reposUrl = `https://api.github.com/users/${username}/repos?per_page=100`;

    // 4. Два fetch одночасно через Promise.all
    const [profileResponse, reposResponse] = await Promise.all([
      fetch(profileUrl, { signal: currentController.signal }),
      fetch(reposUrl, { signal: currentController.signal })
    ]);

    // 5. Перевірка response.ok окремо для кожного запиту
    checkResponse(profileResponse);
    checkResponse(reposResponse);

    const profile = await profileResponse.json();
    const repos = await reposResponse.json();

    // 6. Рендер результату
    renderDashboard(profile, repos);

    const endTime = performance.now();
    console.log(`Час виконання запитів: ${(endTime - startTime).toFixed(2)} ms`);

  } catch (error) {
    if (error.name === "AbortError") {
      console.log("Попередній запит скасовано");
      return;
    }

    renderError(error.message);

  } finally {
    loadBtn.disabled = false;
  }
}

function checkResponse(response) {
  if (response.ok) {
    return;
  }

  if (response.status === 404) {
    throw new Error("Користувача не існує");
  }

  if (response.status === 403) {
    throw new Error("Перевищено rate limit, спробуйте пізніше");
  }

  throw new Error(`Помилка запиту: ${response.status}`);
}

function renderDashboard(profile, repos) {
  resultEl.textContent = "";

  const profileBlock = document.createElement("div");
  profileBlock.className = "profile";

  const avatar = document.createElement("img");
  avatar.src = profile.avatar_url;
  avatar.alt = "Аватар користувача GitHub";

  const profileInfo = document.createElement("div");

  const name = document.createElement("h2");
  name.textContent = profile.name || profile.login;

  const bio = document.createElement("p");
  bio.textContent = profile.bio || "Bio відсутнє";

  profileInfo.appendChild(name);
  profileInfo.appendChild(bio);

  profileBlock.appendChild(avatar);
  profileBlock.appendChild(profileInfo);

  resultEl.appendChild(profileBlock);

  const totalStars = countTotalStars(repos);
  const popularLanguage = findPopularLanguage(repos);
  const topRepos = findTopRepos(repos);

  const statsBlock = document.createElement("div");
  statsBlock.className = "stats";

  statsBlock.appendChild(createStat("Репозиторії", profile.public_repos));
  statsBlock.appendChild(createStat("Мова", popularLanguage));
  statsBlock.appendChild(createStat("Усього зірок", totalStars));

  resultEl.appendChild(statsBlock);

  const topReposBlock = document.createElement("div");
  topReposBlock.className = "top-repos";

  const topReposTitle = document.createElement("h3");
  topReposTitle.textContent = "Топ-3 репозиторії за зірками";

  topReposBlock.appendChild(topReposTitle);

  if (topRepos.length === 0) {
    const emptyText = document.createElement("p");
    emptyText.className = "status";
    emptyText.textContent = "Репозиторії відсутні";
    topReposBlock.appendChild(emptyText);
  } else {
    topRepos.forEach(repo => {
      const repoBlock = document.createElement("div");
      repoBlock.className = "repo";

      const repoName = document.createElement("div");
      repoName.className = "name";
      repoName.textContent = repo.name;

      const repoDesc = document.createElement("div");
      repoDesc.className = "desc";
      repoDesc.textContent = repo.description || "Опис відсутній";

      const repoStars = document.createElement("div");
      repoStars.className = "stars";
      repoStars.textContent = `⭐ ${repo.stargazers_count}`;

      repoBlock.appendChild(repoName);
      repoBlock.appendChild(repoDesc);
      repoBlock.appendChild(repoStars);

      topReposBlock.appendChild(repoBlock);
    });
  }

  resultEl.appendChild(topReposBlock);
}

function createStat(labelText, valueText) {
  const statBlock = document.createElement("div");
  statBlock.className = "stat";

  const label = document.createElement("div");
  label.className = "label";
  label.textContent = labelText;

  const value = document.createElement("div");
  value.className = "value";
  value.textContent = valueText;

  statBlock.appendChild(label);
  statBlock.appendChild(value);

  return statBlock;
}

function countTotalStars(repos) {
  let total = 0;

  repos.forEach(repo => {
    total += repo.stargazers_count;
  });

  return total;
}

function findPopularLanguage(repos) {
  const languages = new Map();

  repos.forEach(repo => {
    if (repo.language) {
      const currentCount = languages.get(repo.language) || 0;
      languages.set(repo.language, currentCount + 1);
    }
  });

  let popularLanguage = "Не вказано";
  let maxCount = 0;

  languages.forEach((count, language) => {
    if (count > maxCount) {
      maxCount = count;
      popularLanguage = language;
    }
  });

  return popularLanguage;
}

function findTopRepos(repos) {
  const copiedRepos = [...repos];

  copiedRepos.sort((a, b) => {
    return b.stargazers_count - a.stargazers_count;
  });

  return copiedRepos.slice(0, 3);
}

function renderError(message) {
  resultEl.textContent = "";

  const errorText = document.createElement("p");
  errorText.className = "error";
  errorText.textContent = message;

  resultEl.appendChild(errorText);
}