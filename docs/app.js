async function loadHistory() {
  const entriesContainer = document.getElementById('ucf-entries');
  const totalPublicationsEl = document.getElementById('total-publications');

  try {
    const response = await fetch('../history.json');
    if (!response.ok) {
      entriesContainer.innerHTML = '<p class="ucf-empty">Aucun historique trouvé.</p>';
      totalPublicationsEl.textContent = '0';
      return;
    }

    const data = await response.json();
    const entries = Array.isArray(data.entries) ? data.entries : [];

    if (entries.length === 0) {
      entriesContainer.innerHTML = '<p class="ucf-empty">Aucune publication enregistrée.</p>';
      totalPublicationsEl.textContent = '0';
      return;
    }

    entries.sort((a, b) => b.date.localeCompare(a.date));
    totalPublicationsEl.textContent = entries.length.toString();
    entriesContainer.innerHTML = '';

    entries.forEach(entry => {
      const card = document.createElement('article');
      card.className = 'ucf-entry-card';

      const left = document.createElement('div');
      const right = document.createElement('div');
      right.className = 'ucf-entry-image-wrapper';

      const header = document.createElement('div');
      header.className = 'ucf-entry-header';

      const dateEl = document.createElement('span');
      dateEl.className = 'ucf-entry-date';
      dateEl.textContent = `📅 ${entry.date}`;

      const idEl = document.createElement('span');
      idEl.className = 'ucf-entry-id';
      idEl.textContent = entry.id || '';

      header.appendChild(dateEl);
      header.appendChild(idEl);

      const titleEl = document.createElement('p');
      titleEl.className = 'ucf-entry-title';
      titleEl.textContent = entry.title || '(Titre non disponible)';

      const metaEl = document.createElement('p');
      metaEl.className = 'ucf-entry-meta';
      metaEl.textContent = `Post : ${entry.post_file} • Image : ${entry.image_file}`;

      left.appendChild(header);
      left.appendChild(titleEl);
      left.appendChild(metaEl);

      if (entry.image_file) {
        const img = document.createElement('img');
        img.className = 'ucf-entry-image';
        img.src = `../images/${entry.image_file}`;
        img.alt = entry.title || entry.image_file;
        img.onerror = () => img.style.display = 'none';
        right.appendChild(img);
      }

      card.appendChild(left);
      card.appendChild(right);
      entriesContainer.appendChild(card);
    });

  } catch (error) {
    console.error(error);
    entriesContainer.innerHTML = '<p class="ucf-empty">Erreur lors du chargement.</p>';
  }
}

async function loadWatchtower() {
  const container = document.getElementById('ucf-watchtower-content');

  try {
    const response = await fetch('../history.json');
    if (!response.ok) {
      container.innerHTML = '<p class="ucf-empty">Impossible de charger l’historique.</p>';
      return;
    }

    const data = await response.json();
    const entries = Array.isArray(data.entries) ? data.entries : [];

    if (entries.length === 0) {
      container.innerHTML = '<p class="ucf-empty">Aucune donnée disponible.</p>';
      return;
    }

    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));

    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      weekDates.push(d);
    }

    const historyMap = {};
    entries.forEach(e => historyMap[e.date] = e);

    let html = '<div class="ucf-watchtower-week">';
    const dayLabels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

    weekDates.forEach((d, i) => {
      const iso = d.toISOString().split('T')[0];
      const isWeekend = i >= 5;
      const entry = historyMap[iso];

      let status = '⚫';
      if (!isWeekend) status = entry ? '🟢' : '🔴';

      html += `
        <div class="ucf-watchtower-day">
          <span class="ucf-day-label">${dayLabels[i]}</span>
          <span class="ucf-day-status">${status}</span>
        </div>
      `;
    });

    html += '</div>';

    const publishedThisWeek = weekDates.filter(d => {
      const iso = d.toISOString().split('T')[0];
      return historyMap[iso];
    }).length;

    html += `
      <div class="ucf-watchtower-stats">
        <div class="ucf-watchtower-stat">
          <span class="ucf-watchtower-stat-label">Publications cette semaine</span>
          <span class="ucf-watchtower-stat-value">${publishedThisWeek}</span>
        </div>

        <div class="ucf-watchtower-stat">
          <span class="ucf-watchtower-stat-label">Total historique</span>
          <span class="ucf-watchtower-stat-value">${entries.length}</span>
        </div>
      </div>
    `;

    container.innerHTML = html;

  } catch (error) {
    console.error(error);
    container.innerHTML = '<p class="ucf-empty">Erreur lors du chargement de la Watchtower.</p>';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadHistory();
  loadWatchtower();
});
