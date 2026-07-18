import fs from 'fs';

async function fetchMemoria() {
  try {
    const res = await fetch("https://www.memoriachilena.gob.cl/602/w3-article-3419.html");
    const html = await res.text();
    console.log("Fetched Memoria Chilena article successfully.");
    
    // Find all images in the HTML
    const imgRegex = /src="([^"]+)"/g;
    let match;
    const images = [];
    while ((match = imgRegex.exec(html)) !== null) {
      if (match[1].includes("articles-") || match[1].includes("602/")) {
        images.push(match[1]);
      }
    }
    console.log("Images found in article:");
    images.forEach(img => console.log(img));
  } catch (err) {
    console.error(err);
  }
}
fetchMemoria();
