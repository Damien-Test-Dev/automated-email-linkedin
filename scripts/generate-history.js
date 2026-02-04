const fs = require("fs");
const path = require("path");

const POSTS_DIR = "./docs/posts";
const IMAGES_DIR = "./docs/images";
const OUTPUT_FILE = "./docs/history.json";

function getPostId(date) {
  return `UCFlow-${date.replace(/-/g, "")}-001`;
}

function loadPosts() {
  if (!fs.existsSync(POSTS_DIR)) {
    console.log("No docs/posts directory found.");
    return [];
  }

  const files = fs.readdirSync(POSTS_DIR);
  const entries = [];

  files.forEach(file => {
    if (!file.endsWith("_post.txt")) return;

    const date = file.replace("_post.txt", "");
    const postPath = path.join(POSTS_DIR, file);
    const text = fs.readFileSync(postPath, "utf8").trim();

    const imageFile = `${date}_image.png`;
    const imagePath = path.join(IMAGES_DIR, imageFile);

    if (!fs.existsSync(imagePath)) {
      console.warn(`⚠ Image missing for ${date}, skipping.`);
      return;
    }

    const entry = {
      date,
      id: getPostId(date),
      image: `images/${imageFile}`,
      text,
      links: []
    };

    entries.push(entry);
  });

  entries.sort((a, b) => a.date.localeCompare(b.date));
  return entries;
}

function saveHistory(entries) {
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(entries, null, 2), "utf8");
  console.log(`✔ history.json generated with ${entries.length} entries`);
}

const entries = loadPosts();
saveHistory(entries);
