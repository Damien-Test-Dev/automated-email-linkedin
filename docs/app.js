document.addEventListener("DOMContentLoaded", () => {
  loadHistory();
  loadReport();
});

async function loadHistory() {
  const response = await fetch("history.json");
  const history = await response.json();
  renderCards(history);
}

function renderCards(entries) {
  const container = document.getElementById("posts-container");
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

    // FUTUR → flou + tag Scheduled
    if (postDate > today) {
      card.classList.add("future");
      tag = "Scheduled";
      tagClass = "tag-scheduled";
    } 
    // PASSÉ / AUJOURD’HUI → Published
    else {
      card.classList.add("published");
      tag = "Published";
      tagClass = "tag-published";
    }

    // POST DU JOUR
    if (postDate.getTime() === today.getTime()) {
      card.classList.add("today");
      tag = "Today";
      tagClass = "tag-today";
    }

    // SEMAINE EN COURS (lundi → vendredi)
    if (postDate >= weekStart && postDate <= weekEnd) {
      card.classList.add("week");

      if (postDate <= today) {
        tag = "Week";
        tagClass = "tag-week";
      }
    }

    // TAG VISUEL
    const tagEl = document.createElement("div");
    tagEl.className = `card-tag ${tagClass}`;
    tagEl.textContent = tag;
    card.appendChild(tagEl);

    // HEADER
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

    // IMAGE
    const img = document.createElement("img");
    img.className = "card-image";
    img.src = entry.image;

    // TEXTE
    const text = document.createElement("div");
    text.className = "card-text";
    text.textContent = entry.text;

    // LIENS
    const links = document.createElement("div");
    links.className = "card-links";

    entry.links.forEach(link => {
      const a = document.createElement("a");
      a.href = link.url;
      a.target = "_blank";
      a.textContent = link.label;
      links.appendChild(a);
    });

    // ASSEMBLAGE
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
