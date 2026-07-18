async function searchOL(title) {
  try {
    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(title)}&limit=10`;
    const res = await fetch(url);
    const data = await res.json();
    console.log(`\n=== Open Library Search for "${title}" ===`);
    if (data.docs) {
      for (const doc of data.docs) {
        console.log(`Title: ${doc.title}, Author: ${doc.author_name?.join(", ")}, Year: ${doc.first_publish_year}`);
        console.log(`  Cover ID (edition_key): ${doc.cover_edition_key}`);
        console.log(`  Cover i: ${doc.cover_i}`);
        if (doc.edition_key) {
          console.log(`  Editions: ${doc.edition_key.slice(0, 5).join(", ")}`);
        }
      }
    }
  } catch (err) {
    console.error(err);
  }
}

async function run() {
  await searchOL("Hijo de ladron");
  await searchOL("Palomita blanca");
  await searchOL("Martin Rivas");
}
run();
