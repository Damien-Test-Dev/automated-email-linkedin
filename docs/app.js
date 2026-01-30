async function loadHistory() {
  const response = await fetch("history.json");
  const data = await response.json();
  return data.entries.sort((a, b) => new Date(b.date) - new Date(a.date));
}

async function loadPostText(filename) {
  const response = await fetch(`posts/${filename}`);
  return response.text();
}

function createPostCard(entry, textContent) {
  const container = document.createElement("div");
  container.className = "post-card";

  const title = document.createElement("h2");
  title.textContent = `Publication du ${entry.date}`;

  const textBlock = document.createElement("pre");
  textBlock.className = "post-text";
  textBlock.textContent = textContent;

  const image = document.createElement("img");
  image.className = "post-image";
  image.src = `images/${entry.image_file}`;
  image.alt = `Image du ${entry.date}`;

  container.appendChild(title);
  container.appendChild(textBlock);
  container.appendChild(image);

  return container;
}

async function renderDashboard() {
  const container = document.getElementById("posts-container");
  const history = await loadHistory();

  for (const entry of history) {
    const textContent = await loadPostText(entry.post_file);
    const card = createPostCard(entry, textContent);
    container.appendChild(card);
  }
}

renderDashboard();
