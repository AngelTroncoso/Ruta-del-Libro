const axios = require('axios');

const API_KEY = '595245d388f542c4f7c374c45095ae65';
const BASE_URL = 'https://api.themoviedb.org/3';

async function searchMedia(title, type) {
  const searchType = type === 'Serie' ? 'tv' : 'movie';
  try {
    const res = await axios.get(`${BASE_URL}/search/${searchType}`, {
      params: {
        api_key: API_KEY,
        query: title,
        language: 'es-CL'
      }
    });
    if (res.data.results && res.data.results.length > 0) {
      const bestMatch = res.data.results[0];
      if (bestMatch.poster_path) {
        return `https://image.tmdb.org/t/p/w500${bestMatch.poster_path}`;
      }
    }
  } catch (e) {
    console.error(`Error searching ${title}:`, e.message);
  }
  return null;
}

const movies = [
  "No", "Machuca", "El Club", "Una Mujer Fantástica", "El Agente Topo", 
  "Gloria", "Historia de un Oso", "Taxi para tres", "Julio comienza en julio", "La Frontera"
];

const series = [
  "Los 80", "Bala Loca", "El Reemplazante", "Sudamerican Rockers", "Ecos del Desierto",
  "Héroes", "Ramona", "Mary & Mike", "Cromosoma 21", "Martín Rivas"
];

async function run() {
  const results = { movies: {}, series: {} };
  
  for (const m of movies) {
    const img = await searchMedia(m, 'Pelicula');
    results.movies[m] = img;
  }
  
  for (const s of series) {
    const img = await searchMedia(s, 'Serie');
    results.series[s] = img;
  }
  
  console.log(JSON.stringify(results, null, 2));
}

run();
