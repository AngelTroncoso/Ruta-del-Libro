async function getGoodreadsImage(bookUrl) {
  try {
    const res = await fetch(bookUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
      }
    });
    if (res.status !== 200) {
      console.log(`Failed to fetch ${bookUrl}: status ${res.status}`);
      return null;
    }
    const html = await res.text();
    const ogImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i) ||
                         html.match(/<meta\s+content=["']([^"']+)["']\s+property=["']og:image["']/i);
    if (ogImageMatch) {
      return ogImageMatch[1];
    }
    
    const regex = /https:\/\/compressed\.photo\.goodreads\.com\/books\/[^"']+/g;
    const matches = html.match(regex);
    if (matches && matches.length > 0) {
      return matches[0];
    }
  } catch (err) {
    console.error(`Error fetching ${bookUrl}: ${err.message}`);
  }
  return null;
}

async function searchAndScrape() {
  // Let's search for Goodreads show URLs on Google or try typical goodreads show IDs
  const urls = [
    // Palomita Blanca editions
    "https://www.goodreads.com/book/show/24445454-palomita-blanca",
    "https://www.goodreads.com/book/show/1594246.Palomita_blanca",
    "https://www.goodreads.com/book/show/58231221-palomita-blanca",
    "https://www.goodreads.com/book/show/24225574-palomita-blanca",
    
    // Hijo de Ladrón editions
    "https://www.goodreads.com/book/show/22237072-hijo-de-ladr-n",
    "https://www.goodreads.com/book/show/1360057.Hijo_de_ladr_n",
    "https://www.goodreads.com/book/show/28807090-hijo-de-ladr-n",
    "https://www.goodreads.com/book/show/36592233-hijo-de-ladr-n"
  ];

  for (const url of urls) {
    console.log(`\nFetching ${url}...`);
    const imgUrl = await getGoodreadsImage(url);
    if (imgUrl) {
      console.log(`=> Cover Image URL: ${imgUrl}`);
    } else {
      console.log(`=> No cover image found.`);
    }
  }
}

searchAndScrape();
