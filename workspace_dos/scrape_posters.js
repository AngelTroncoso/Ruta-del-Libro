const axios = require('axios');
const fs = require('fs');

async function getWikiImage(title) {
  try {
    const url = `https://es.wikipedia.org/w/api.php?action=query&prop=pageimages&titles=${encodeURIComponent(title)}&pithumbsize=500&format=json`;
    const res = await axios.get(url);
    const pages = res.data.query.pages;
    const pageId = Object.keys(pages)[0];
    if (pageId !== '-1' && pages[pageId].thumbnail) {
      return pages[pageId].thumbnail.source;
    }
  } catch (e) {}
  return null;
}

async function getTVMazeImage(title) {
  try {
    const url = `https://api.tvmaze.com/singlesearch/shows?q=${encodeURIComponent(title)}`;
    const res = await axios.get(url);
    if (res.data && res.data.image && res.data.image.original) {
      return res.data.image.original;
    }
  } catch (e) {}
  return null;
}

const movies = ['No (película)', 'Machuca', 'El club', 'Una mujer fantástica', 'El agente topo', 'Gloria (película de 2013)', 'Historia de un oso', 'Taxi para tres', 'Julio comienza en julio', 'La frontera (película)'];
const books = ['Tengo miedo torero (novela)', 'La casa de los espíritus', 'Los detectives salvajes', 'Veinte poemas de amor y una canción desesperada', 'Sub terra', 'Papelucho', 'Hijo de ladrón', 'El obsceno pájaro de la noche', 'Desolación (libro)', 'Altazor'];
const series = ['Los 80', 'Bala loca', 'El reemplazante', 'Sudamerican Rockers', 'Ecos del desierto', 'Héroes (serie de televisión de Chile)', 'Ramona (serie de televisión chilena)', 'Mary & Mike', 'Cromosoma 21 (serie de televisión)', 'Martín Rivas (telenovela de 2010)'];

async function run() {
  const results = { movies: [], books: [], series: [] };
  
  for (const m of movies) results.movies.push(await getWikiImage(m));
  for (const b of books) results.books.push(await getWikiImage(b));
  
  for (const s of series) {
    let img = await getTVMazeImage(s);
    if (!img) img = await getWikiImage(s);
    results.series.push(img);
  }
  
  console.log(JSON.stringify(results, null, 2));
}

run();
