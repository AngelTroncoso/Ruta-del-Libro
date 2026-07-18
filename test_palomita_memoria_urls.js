const urls = [
  "https://www.memoriachilena.gob.cl/602/articles-76804_thumbnail.jpg",
  "https://www.memoriachilena.gob.cl/602/articles-76804_thumbnail.thumb.jpg",
  "https://www.memoriachilena.gob.cl/602/articles-76804_recurso_img1.jpg",
  "https://www.memoriachilena.gob.cl/602/articles-81863_thumbnail.jpg",
  "https://www.memoriachilena.gob.cl/602/articles-81863_thumbnail.thumb.jpg",
  "https://www.memoriachilena.gob.cl/602/articles-81863_recurso_img1.jpg"
];

async function run() {
  for (const url of urls) {
    try {
      const res = await fetch(url, { method: "HEAD" });
      console.log(`${url}: ${res.status}`);
    } catch (e) {
      console.log(`${url}: Error ${e.message}`);
    }
  }
}
run();
