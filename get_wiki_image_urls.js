async function getWikiImageUrl(fileName) {
  try {
    const url = `https://es.wikipedia.org/w/api.php?action=query&prop=imageinfo&titles=${encodeURIComponent(fileName)}&iiprop=url&format=json`;
    const res = await fetch(url);
    const data = await res.json();
    console.log(`=== URL for "${fileName}" ===`);
    const pages = data.query?.pages;
    if (pages) {
      const pageId = Object.keys(pages)[0];
      const info = pages[pageId].imageinfo?.[0];
      if (info) {
        console.log(`URL: ${info.url}`);
      } else {
        console.log("No info found.");
      }
    }
  } catch (err) {
    console.error(err);
  }
}

async function run() {
  await getWikiImageUrl("Archivo:Martin Rivas.jpg");
  await getWikiImageUrl("Archivo:Portada Martin Rivas.jpg");
}
run();
