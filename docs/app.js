async function fetchJSON(path) {
  const res = await fetch(path);
  if (!res.ok) {
    throw new Error(`Erreur de chargement : ${path}`);
  }
  return res.json();
}

async function fetchText(path) {
  const res = await fetch(path);
  if (!res.ok) {
    throw new Error(`Erreur de chargement : ${path}`);
  }
  return res.text();
}

function createPostCard(entry, payload) {
  const container = document.getElementById("posts-container");

  const card = document.createElement("article");
  card.className = "card";

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
  img.src = payload.image || entry.image_file || "";
  img.alt = `Image pour ${entry.date}`;

  const textEl = document.createElement("div");
  textEl.className = "card-text";
  textEl.textContent = payload.text || "(Aucun texte trouvé dans le payload)";

  const links = document.createElement("div");
  links.className = "card-links";

  const payloadLink = document.createElement("a");
  payloadLink.href = `payload/${entry.date}.json`;
  payloadLink.target = "_blank";
  payloadLink.rel = "noopener noreferrer";
  payloadLink.textContent = "Voir le payload JSON";

  const postSourceLink = document.createElement("a");
  postSourceLink.href = `posts/${entry.post_file}`;
  postSourceLink.target = "_blank";
  postSourceLink.rel = "noopener noreferrer";
  postSourceLink.textContent = "Voir le fichier post";

  const imageSourceLink = document.createElement("a");
  imageSourceLink.href = `images/${entry.image_file}`;
  imageSourceLink.target = "_blank";
  imageSourceLink.rel = "noopener noreferrer";
  imageSourceLink.textContent = "Voir le fichier image";

  links.appendChild(payloadLink);
  links.appendChild(postSourceLink);
  links.appendChild(imageSourceLink);

  card.appendChild(header);
  card.appendChild(img);
  card.appendChild(textEl);
  card.appendChild(links);

  container.appendChild(card);
}

async function loadPosts() {
  try {
    const history = await fetchJSON("../history.json");
    const entries = (history.entries || []).slice().sort((a, b) =>
      a.date < b.date ? 1 : -1
    );

    for (const entry of entries) {
      const payloadPath = `payload/${entry.date}.json`;
      try {
        const payload = await fetchJSON(payloadPath);
        createPostCard(entry, payload);
      } catch (e) {
        console.error(`Erreur payload pour ${entry.date}:`, e);
        createPostCard(entry, {
          text: "(Payload introuvable ou illisible)",
          image: `images/${entry.image_file}`,
        });
      }
    }
  } catch (e) {
    console.error("Erreur de chargement de history.json :", e);
  }
}

async function loadReport() {
  const container = document.getElementById("report-container");
  try {
    const text = await fetchText("reports/rename_report.md");
    container.textContent = text;
  } catch (e) {
    console.error("Erreur de chargement du rapport :", e);
    container.textContent = "Aucun rapport de renommage disponible.";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadPosts();
  loadReport();
});
