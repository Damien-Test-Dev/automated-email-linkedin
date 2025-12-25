// script.js
// Dashboard ultra complet basé sur posts_history.csv

const HISTORY_CSV_PATH = "../posts_history.csv";

let allEntries = [];

// Utilitaire : parser CSV simple (en supposant pas de virgules dans les champs)
function parseCsv(text) {
  const lines = text.trim().split("\n");
  const header = lines[0].split(",");
  const rows = lines.slice(1).map((line) => {
    const cols = line.split(",");
    const obj = {};
    header.forEach((h, i) => {
      obj[h.trim()] = (cols[i] || "").trim();
    });
    return obj;
  });
  return rows;
}

function formatDateFR(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getTodayISO() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function isFuture(dateStr) {
  const today = getTodayISO();
  return dateStr > today;
}

function isPast(dateStr) {
  const today = getTodayISO();
  return dateStr < today;
}

function updateLastUpdated() {
  const el = document.getElementById("last-updated");
  const now = new Date();
  el.textContent =
    "Dernière mise à jour : " +
    now.toLocaleDateString("fr-FR") +
    " " +
    now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

// === Synthèse globale ===
function updateGlobalStats(entries) {
  const total = entries.length;
  const uniqueDates = new Set(entries.map((e) => e.date).filter(Boolean));

  const prepared = entries.filter((e) => e.etat === "preparé").length;
  const imageReady = entries.filter((e) => e.etat === "image_prete").length;
  const readyToPublish = entries.filter(
    (e) => e.etat === "pret_pour_publication"
  ).length;

  document.getElementById("stat-total-posts").textContent = total;
  document.getElementById("stat-days-covered").textContent = uniqueDates.size;
  document.getElementById("stat-prepared").textContent = prepared;
  document.getElementById("stat-image-ready").textContent = imageReady;
  document.getElementById("stat-ready-to-publish").textContent =
    readyToPublish;

  // Couverture 30 jours
  const today = new Date(getTodayISO() + "T00:00:00");
  const daysWindow = 30;
  let covered = 0;
  for (let i = 0; i < daysWindow; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    if (entries.some((e) => e.date === iso)) {
      covered++;
    }
  }
  const coverage = Math.round((covered / daysWindow) * 100);
  document.getElementById("stat-coverage-30").textContent = coverage + " %";

  // Prochain jour sans post dans les 30 jours
  let nextUncovered = null;
  for (let i = 0; i < daysWindow; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    if (!entries.some((e) => e.date === iso)) {
      nextUncovered = iso;
      break;
    }
  }
  const elNext = document.getElementById("next-uncovered-day");
  if (nextUncovered) {
    elNext.textContent =
      "Prochain jour sans post (sur 30 jours) : " +
      formatDateFR(nextUncovered);
  } else {
    elNext.textContent = "Tous les 30 prochains jours ont au moins un post.";
  }
}

// === Semaine en cours ===

function getCurrentWeekRange() {
  const today = new Date(getTodayISO() + "T00:00:00");
  let monday = new Date(today);
  // 0 = dimanche, 1 = lundi, ..., 6 = samedi
  const day = today.getDay();
  const diff = day === 0 ? -6 : 1 - day; // si dimanche, reculer de 6, sinon 1 - day
  monday.setDate(today.getDate() + diff);

  const dates = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d);
  }
  return dates;
}

function getBestStatusForDate(entries, dateStr) {
  const statesPriority = [
    "pret_pour_publication",
    "image_prete",
    "preparé",
  ];

  const forDate = entries.filter((e) => e.date === dateStr);
  if (forDate.length === 0) return null;

  for (const st of statesPriority) {
    if (forDate.some((e) => e.etat === st)) return st;
  }
  return forDate[0].etat || null;
}

function renderCurrentWeek(entries) {
  const weekDates = getCurrentWeekRange();
  const container = document.getElementById("week-grid");
  container.innerHTML = "";

  // En-tête plage de dates
  const rangeText =
    formatDateFR(weekDates[0].toISOString().slice(0, 10)) +
    " → " +
    formatDateFR(weekDates[4].toISOString().slice(0, 10));
  document.getElementById("current-week-range").textContent = rangeText;

  const weekdayNames = ["Lun", "Mar", "Mer", "Jeu", "Ven"];

  weekDates.forEach((dateObj, idx) => {
    const iso = dateObj.toISOString().slice(0, 10);
    const status = getBestStatusForDate(entries, iso);

    const card = document.createElement("div");
    card.className = "week-day-card";

    const title = document.createElement("div");
    title.className = "week-day-title";
    title.textContent = weekdayNames[idx];
    card.appendChild(title);

    const dateEl = document.createElement("div");
    dateEl.className = "week-day-date";
    dateEl.textContent = formatDateFR(iso);
    card.appendChild(dateEl);

    const statusEl = document.createElement("div");
    let pillClass = "status-pill-none";
    let label = "Aucun post";

    if (status) {
      pillClass = "status-pill-" + status;
      if (status === "preparé") label = "Préparé";
      else if (status === "image_prete") label = "Image prête";
      else if (status === "pret_pour_publication")
        label = "Prêt pour publication";
      else label = status;
    }

    statusEl.className = "week-day-status " + pillClass;
    statusEl.textContent = label;
    card.appendChild(statusEl);

    const meta = document.createElement("div");
    meta.className = "week-day-meta";
    const dayEntries = entries.filter((e) => e.date === iso);
    if (dayEntries.length > 0) {
      meta.textContent = dayEntries.length + " entrée(s) dans l'historique";
    } else {
      meta.textContent = "Aucune entrée dans l'historique";
    }
    card.appendChild(meta);

    container.appendChild(card);
  });
}

// === Tableau calendrier éditorial ===

function passesFilters(entry, filters) {
  // Filtre état
  if (filters.status && entry.etat !== filters.status) {
    return false;
  }

  // Filtre période
  if (filters.period === "past" && !isPast(entry.date)) {
    return false;
  }
  if (filters.period === "future" && !isFuture(entry.date)) {
    return false;
  }

  // Recherche
  if (filters.search) {
    const q = filters.search.toLowerCase();
    const haystack = (
      entry.date +
      " " +
      entry.jour +
      " " +
      entry.heure +
      " " +
      entry.etat +
      " " +
      entry.image +
      " " +
      entry.chemin_fichier_post
    ).toLowerCase();
    if (!haystack.includes(q)) {
      return false;
    }
  }

  return true;
}

function renderCalendar(entries) {
  const tbody = document.getElementById("calendar-body");
  tbody.innerHTML = "";

  const statusFilter = document.getElementById("filter-status").value;
  const periodFilter = document.getElementById("filter-period").value;
  const searchValue = document.getElementById("search-input").value.trim();

  const filters = {
    status: statusFilter || "",
    period: periodFilter || "all",
    search: searchValue || "",
  };

  const filtered = entries.filter((e) => passesFilters(e, filters));

  // Tri par date croissante
  filtered.sort((a, b) => (a.date > b.date ? 1 : a.date < b.date ? -1 : 0));

  filtered.forEach((e) => {
    const tr = document.createElement("tr");

    const tdDate = document.createElement("td");
    tdDate.textContent = formatDateFR(e.date);
    tr.appendChild(tdDate);

    const tdJour = document.createElement("td");
    tdJour.textContent = e.jour;
    tr.appendChild(tdJour);

    const tdHeure = document.createElement("td");
    tdHeure.textContent = e.heure || "—";
    tr.appendChild(tdHeure);

    const tdEtat = document.createElement("td");
    tdEtat.textContent = e.etat || "—";
    tdEtat.className = "td-etat";
    if (e.etat) {
      tdEtat.classList.add("td-etat-" + e.etat);
    }
    tr.appendChild(tdEtat);

    const tdImage = document.createElement("td");
    tdImage.className = "td-image";
    if (e.image) {
      const link = document.createElement("a");
      link.href = "../" + e.image;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "Voir";
      tdImage.appendChild(link);
    } else {
      tdImage.textContent = "—";
    }
    tr.appendChild(tdImage);

    const tdPost = document.createElement("td");
    tdPost.className = "td-post";
    if (e.chemin_fichier_post) {
      const link = document.createElement("a");
      link.href = "../" + e.chemin_fichier_post;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = e.chemin_fichier_post;
      tdPost.appendChild(link);
    } else {
      tdPost.textContent = "—";
    }
    tr.appendChild(tdPost);

    tbody.appendChild(tr);
  });

  const countEl = document.getElementById("calendar-count");
  countEl.textContent =
    filtered.length +
    " entrée(s) affichée(s) sur " +
    entries.length +
    " au total.";
}

// === Initialisation ===

async function loadHistory() {
  try {
    const res = await fetch(HISTORY_CSV_PATH + "?t=" + Date.now());
    if (!res.ok) {
      throw new Error("Impossible de charger posts_history.csv");
    }
    const text = await res.text();
    const rows = parseCsv(text);
    allEntries = rows.filter((r) => r.date); // filtrer si lignes vides

    updateLastUpdated();
    updateGlobalStats(allEntries);
    renderCurrentWeek(allEntries);
    renderCalendar(allEntries);
  } catch (err) {
    console.error(err);
    alert(
      "Erreur lors du chargement de posts_history.csv.\nVérifie que le fichier existe à la racine du repo."
    );
  }
}

function attachFilterListeners() {
  const statusEl = document.getElementById("filter-status");
  const periodEl = document.getElementById("filter-period");
  const searchEl = document.getElementById("search-input");

  const rerender = () => {
    renderCalendar(allEntries);
  };

  statusEl.addEventListener("change", rerender);
  periodEl.addEventListener("change", rerender);
  searchEl.addEventListener("input", rerender);
}

document.addEventListener("DOMContentLoaded", () => {
  attachFilterListeners();
  loadHistory();
});
