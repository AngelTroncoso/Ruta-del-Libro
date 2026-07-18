const axios = require('axios');

async function getOpenLibraryCover(title) {
  try {
    const res = await axios.get(`https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&limit=1`);
    if (res.data.docs && res.data.docs.length > 0) {
      const coverId = res.data.docs[0].cover_i;
      if (coverId) {
        return `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`;
      }
    }
  } catch (e) {}
  return null;
}

const books = [
  "Tengo miedo torero",
  "La casa de los espíritus",
  "Los detectives salvajes",
  "Veinte poemas de amor",
  "Sub terra",
  "Papelucho",
  "Hijo de ladrón",
  "El obsceno pájaro de la noche",
  "Desolación",
  "Altazor"
];

async function run() {
  const results = {};
  for (const b of books) {
    results[b] = await getOpenLibraryCover(b);
  }
  console.log(JSON.stringify(results, null, 2));
}

run();
