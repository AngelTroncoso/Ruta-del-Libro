async function searchOpenLibrary(title, author) {
  try {
    const q = `title:${title} author:${author}`;
    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=10`;
    const res = await fetch(url);
    if (!res.ok) {
      console.log(`Failed to fetch Open Library: status ${res.status}`);
      return;
    }
    const data = await res.json();
    console.log(`\n=== Open Library Search for "${title}" by ${author} ===`);
    if (data.docs) {
      for (const doc of data.docs) {
        console.log(`Title: ${doc.title}, First Publish Year: ${doc.first_publish_year}`);
        console.log(`  Languages: ${doc.language?.join(", ")}`);
        console.log(`  Publishers: ${doc.publisher?.slice(0, 3).join(", ")}`);
        if (doc.cover_i) {
          console.log(`  Cover ID: ${doc.cover_i} => URL: https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`);
        } else if (doc.cover_edition_key) {
          console.log(`  Cover Edition Key: ${doc.cover_edition_key} => URL: https://covers.openlibrary.org/b/olid/${doc.cover_edition_key}-L.jpg`);
        }
        if (doc.edition_key) {
          console.log(`  Edition Keys: ${doc.edition_key.slice(0, 3).join(", ")}`);
        }
      }
    } else {
      console.log("No documents found.");
    }
  } catch (err) {
    console.error(err);
  }
}

async function run() {
  await searchOpenLibrary("Palomita blanca", "Enrique Lafourcade");
  await searchOpenLibrary("Hijo de ladrón", "Manuel Rojas");
  await searchOpenLibrary("Martín Rivas", "Alberto Blest Gana");
}
run();
