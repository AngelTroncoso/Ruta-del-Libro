async function checkWikiImage(page) {
  try {
    const url = `https://es.wikipedia.org/w/api.php?action=query&prop=images&titles=${encodeURIComponent(page)}&format=json`;
    const res = await fetch(url);
    const data = await res.json();
    console.log(`=== Wikipedia images for "${page}" ===`);
    const pages = data.query?.pages;
    if (pages) {
      const pageId = Object.keys(pages)[0];
      const images = pages[pageId].images;
      if (images) {
        for (const img of images) {
          console.log(`- ${img.title}`);
        }
      } else {
        console.log("No images found.");
      }
    }
  } catch (err) {
    console.error(err);
  }
}

async function run() {
  await checkWikiImage("Martín Rivas");
  await checkWikiImage("Hijo de ladrón");
  await checkWikiImage("Palomita blanca (novela)");
}
run();
