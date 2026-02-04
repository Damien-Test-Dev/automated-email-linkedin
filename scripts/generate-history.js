const fs = require("fs");
const path = require("path");

const POSTS_DIR = "./posts";
const IMAGES_DIR = "./docs/images";
const OUTPUT_FILE = "./docs/history.json";

function getPostId(date) {
  return `UCFlow-${date.replace(/-/g, "")}-001`;
}

function loadPosts() {
  const files = fs.readdirSync(POSTS_DIR);
  const posts = [];

  files.forEach(file => {
    if (!file.endsWith("_post.txt")) return;

    const date = file.replace("_post.txt", "");
    const text = fs.readFileSync(path.join(POSTS_DIR, file), "utf8");

    const imageFile = `${date}_image.png`;
    const imagePath = path.join(IMAGES_DIR, imageFile);

    const entry = {
      date,
      id: getPostId(date),
      image: `images/${imageFile}`,
      text,
      links: []
    };

    posts.push(entry);
  });

  return posts;
}

function saveHistory(entries) {
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(entries, null, 2));
  console.log("✔ history.json generated");
}

const entries = loadPosts();
saveHistory(entries);
