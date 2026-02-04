async function loadHistory() {
  const response = await fetch("history.json");
  const history = await response.json();
  renderCards(history);
}

function renderCards(entries) {
  const container = document.getElementById("cards-container");
  container.innerHTML = "";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay() + 1); // lundi

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 4); // vendredi

  entries.forEach(entry => {
    const card = document.createElement("div");
    card.className = "card";

    const postDate = new Date(entry.date);
    postDate.setHours(0, 0, 0, 0);

    let tag = "";
    let tagClass = "";

    if (postDate > today) {
      card.classList.add("future");
      tag = "Scheduled";
      tagClass = "tag-scheduled";
    } else {
      card.classList.add("published");
      tag = "Published";
      tagClass = "tag-published";
    }

    if (postDate.getTime() === today.getTime()) {
      card.classList.add("today");
      tag = "Today";
      tagClass = "tag-today";
    }

    if (postDate >= weekStart && postDate <= weekEnd) {
      card.classList.add("week");
      if (postDate <= today) {
        tag = "Week";
        tagClass = "tag-week";
      }
    }

    const tagEl = document.createElement("div");
    tagEl.className = `card-tag ${tagClass}`;
    tagEl.textContent = tag;
    card.appendChild(tagEl);

    const header = document.createElement("div");
    header.className = "card-header";

    const dateEl = document.createElement("div");
    dateEl.className = "card-date";
    dateEl.textContent = entry.date;

    const idEl = document.createElement("div");
    idEl.className = "card-id";
    idEl.textContent = entry.id;

    header.appendChild(dateEl);
    header.appendChild(idEl);

    const img = document.createElement("img");
    img.className = "card-image";
    img.src = entry.image;

    const text = document.createElement("div");
    text.className = "card-text";
    text.textContent = entry.text;

    const links = document.createElement("div");
    links.className = "card-links";

    entry.links.forEach(link => {
      const a = document.createElement("a");
      a.href = link.url;
      a.target = "_blank";
      a.textContent = link.label;
      links.appendChild(a);
    });

    card.appendChild(header);
    card.appendChild(img);
    card.appendChild(text);
    card.appendChild(links);

    container.appendChild(card);
  });
}

async function loadReport() {
  const response = await fetch("reports/rename_report.md");
  const text = await response.text();
  document.getElementById("report-container").textContent = text;
}

loadHistory();
loadReport();
