async function getBuscalibreCover(isbn, name) {
  try {
    const url = `https://www.buscalibre.cl/libro-de-la-editorial-zig-zag/${isbn}/p/52219717`; // or just query search
    const searchUrl = `https://www.buscalibre.cl/libros/search?q=${isbn}`;
    const res = await fetch(searchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
      }
    });
    if (res.status !== 200) {
      console.log(`Failed to search ${isbn}: status ${res.status}`);
      return;
    }
    const html = await res.text();
    // Look for image source patterns, e.g., images.buscalibre.com/libros/...
    const imgRegex = /https:\/\/images\.buscalibre\.com\/libros\/[^"]+/g;
    const matches = html.match(imgRegex);
    console.log(`\n=== Buscalibre search results for ${name} (${isbn}) ===`);
    if (matches && matches.length > 0) {
      const uniqueMatches = [...new Set(matches)];
      uniqueMatches.forEach((img, idx) => {
        console.log(`- Match ${idx + 1}: ${img}`);
      });
    } else {
      console.log("No images found on search results page.");
    }
  } catch (err) {
    console.error(err);
  }
}

async function run() {
  await getBuscalibreCover("9789561234475", "Palomita blanca");
  await getBuscalibreCover("9789561233812", "Hijo de ladrón");
  await getBuscalibreCover("9789561233805", "Martín Rivas"); // typical Zig Zag Martín Rivas ISBN
}
run();
