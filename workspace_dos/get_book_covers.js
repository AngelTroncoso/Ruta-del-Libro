const axios = require('axios');

async function getBookCover(title, author) {
  try {
    const query = encodeURIComponent(`intitle:${title}+inauthor:${author}`);
    const url = `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=1`;
    const res = await axios.get(url);
    if (res.data.items && res.data.items.length > 0) {
      const info = res.data.items[0].volumeInfo;
      if (info.imageLinks && info.imageLinks.thumbnail) {
        // Mejorar calidad quitando el parámetro zoom o cambiándolo a higherres
        return info.imageLinks.thumbnail.replace('&edge=curl', '').replace('zoom=1', 'zoom=2');
      }
    }
  } catch (e) {
    console.error(`Error with ${title}:`, e.message);
  }
  return null;
}

const books = [
  { t: "Tengo miedo torero", a: "Pedro Lemebel" },
  { t: "La casa de los mejores espíritus", a: "Isabel Allende" },
  { t: "Los detectives salvajes", a: "Roberto Bolaño" },
  { t: "Veinte poemas de amor y una canción desesperada", a: "Pablo Neruda" },
  { t: "Sub terra", a: "Baldomero Lillo" },
  { t: "Papelucho", a: "Marcela Paz" },
  { t: "Hijo de ladrón", a: "Manuel Rojas" },
  { t: "El obsceno pájaro de la noche", a: "José Donoso" },
  { t: "Desolación", a: "Gabriela Mistral" },
  { t: "Altazor", a: "Vicente Huidobro" }
];

async function run() {
  const results = {};
  for (const b of books) {
    const img = await getBookCover(b.t, b.a);
    results[b.t] = img;
  }
  console.log(JSON.stringify(results, null, 2));
}

run();
