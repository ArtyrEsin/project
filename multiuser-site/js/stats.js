const allCount = document.getElementById("allCount");
const finishedCount = document.getElementById("finishedCount");
const progressCount = document.getElementById("progressCount");
const percentCount = document.getElementById("percentCount");
const authorsTotal = document.getElementById("authorsTotal");
const categoryStats = document.getElementById("categoryStats");
const authorStats = document.getElementById("authorStats");

function renderStatItems(container, dataObject, emptyText) {
  container.innerHTML = "";

  let keys = Object.keys(dataObject);

  if (keys.length === 0) {
    container.innerHTML = `<p>${emptyText}</p>`;
    return;
  }

  for (let i = 0; i < keys.length; i++) {
    let key = keys[i];
    let item = document.createElement("div");
    item.className = "category-item";
    item.innerHTML = `<span>${key}</span><strong>${dataObject[key]}</strong>`;
    container.appendChild(item);
  }
}

function showStats() {
  let projects = getProjects();
  let doneCount = 0;
  let categories = {};
  let authors = {};
  let percent = 0;

  for (let i = 0; i < projects.length; i++) {
    let project = projects[i];

    if (project.done === true) {
      doneCount++;
    }

    if (project.category) {
      if (categories[project.category]) {
        categories[project.category]++;
      } else {
        categories[project.category] = 1;
      }
    }

    if (project.author) {
      if (authors[project.author]) {
        authors[project.author]++;
      } else {
        authors[project.author] = 1;
      }
    }
  }

  let progressProjects = projects.length - doneCount;

  if (projects.length > 0) {
    percent = Math.round((doneCount / projects.length) * 100);
  }

  allCount.textContent = projects.length;
  finishedCount.textContent = doneCount;
  progressCount.textContent = progressProjects;
  percentCount.textContent = percent + "%";
  authorsTotal.textContent = Object.keys(authors).length;

  renderStatItems(categoryStats, categories, "Категории пока отсутствуют.");
  renderStatItems(authorStats, authors, "Авторы пока отсутствуют.");
}

showStats();
