async function searchGoogleBooks(title, author) {
  try {
    const q = title.startsWith("isbn:") ? title : `${title} ${author}`;
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=5`;
    const res = await fetch(url);
    const data = await res.json();
    console.log(`\n=== Google Books Search for "${title}" by ${author} ===`);
    if (data.items) {
      for (const item of data.items) {
        const info = item.volumeInfo;
        console.log(`Title: ${info.title}, Author: ${info.authors?.join(", ")}, Language: ${info.language}`);
        console.log(`  Thumbnail: ${info.imageLinks?.thumbnail}`);
        console.log(`  Small Thumbnail: ${info.imageLinks?.smallThumbnail}`);
      }
    } else {
      console.log("No items found.");
    }
  } catch (err) {
    console.error(err);
  }
}

async function run() {
  await searchGoogleBooks("isbn:9789561233812", "Hijo de ladrón");
  await searchGoogleBooks("isbn:9789561234475", "Palomita blanca");
  await searchGoogleBooks("isbn:9789561233805", "Martín Rivas");
}
run();
