// Chargement et affichage des publications depuis docs/history.json

async function loadHistory() {
  const container = document.getElementById("posts-container");

  try {
    const response = await fetch("history.json");
    if (!response.ok) {
      container.innerHTML = "<p>Aucun historique disponible.</p>";
      return;
    }

    const data = await response.json();
    const entries = data.entries || [];

    if (entries.length === 0) {
      container.innerHTML = "<p>Aucune publication enregistrée pour le moment.</p>";
      return;
    }

    // Tri des entrées par date décroissante
    entries.sort((a, b) => (a.date < b.date ? 1 : -1));

    const fragments = document.createDocumentFragment();

    for (const entry of entries) {
      const card = document.createElement("article");
      card.className = "post-card";

      const title = document.createElement("h3");
      title.textContent = `${entry.date} — ${entry.id || ""}`;

      const textBlock = document.createElement("div");
      textBlock.className = "post-text";

      const postLink = document.createElement("a");
      postLink.href = `posts/${entry.post_file}`;
      postLink.textContent = entry.post_file;
      postLink.target = "_blank";

      textBlock.appendChild(postLink);

      const imageBlock = document.createElement("div");
      imageBlock.className = "post-image";

      if (entry.image_file) {
        const img = document.createElement("img");
        img.src = `images/${entry.image_file}`;
        img.alt = entry.image_file;
        imageBlock.appendChild(img);
      } else {
        const noImg = document.createElement("p");
        noImg.textContent = "Aucune image associée.";
        imageBlock.appendChild(noImg);
      }

      card.appendChild(title);
      card.appendChild(textBlock);
      card.appendChild(imageBlock);

      fragments.appendChild(card);
    }

    container.innerHTML = "";
    container.appendChild(fragments);

  } catch (error) {
    console.error("Erreur lors du chargement de history.json :", error);
    container.innerHTML = "<p>Erreur lors du chargement de l'historique.</p>";
  }
}

// Chargement et affichage du rapport de renommage depuis docs/reports/rename_report.md

async function loadRenameReport() {
  const target = document.getElementById("rename-report-table");
  const reportUrl = "reports/rename_report.md";

  try {
    const response = await fetch(reportUrl);
    if (!response.ok) {
      target.innerHTML = "<p>Aucun rapport disponible.</p>";
      return;
    }

    const text = await response.text();
    const lines = text
      .split("\n")
      .map(l => l.trim())
      .filter(l => l.startsWith("- "));

    if (lines.length === 0) {
      target.innerHTML = "<p>Le rapport est vide.</p>";
      return;
    }

    let html = `
      <table class="report-table">
        <thead>
          <tr>
            <th>Action</th>
            <th>Ancien nom</th>
            <th>Nouveau nom</th>
          </tr>
        </thead>
        <tbody>
    `;

    for (const line of lines) {
      const clean = line.replace("- ", "").trim();

      let action = "";
      let oldName = "";
      let newName = "";

      if (clean.includes("→")) {
        const parts = clean.split("→");
        oldName = parts[0].replace(/.*:/, "").trim();
        newName = parts[1].trim();

        if (clean.includes("Renommage")) action = "Renommage";
        else if (clean.includes("Conversion")) action = "Conversion";
        else action = "Opération";
      } else {
        action = "Skip";
        oldName = clean.replace(/.*:/, "").trim();
        newName = "-";
      }

      html += `
        <tr>
          <td>${action}</td>
          <td>${oldName}</td>
          <td>${newName}</td>
        </tr>
      `;
    }

    html += "</tbody></table>";
    target.innerHTML = html;

  } catch (error) {
    console.error("Erreur lors du chargement du rapport de renommage :", error);
    target.innerHTML = "<p>Erreur lors du chargement du rapport.</p>";
  }
}

// Initialisation du dashboard

loadHistory();
loadRenameReport();
