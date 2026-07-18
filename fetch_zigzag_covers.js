import fs from 'fs';

async function fetchZigZagCover(subpath, name) {
  try {
    const url = `https://www.zigzag.cl/${subpath}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
      }
    });
    if (res.status !== 200) {
      console.log(`Failed to fetch ${url}: status ${res.status}`);
      return;
    }
    const html = await res.text();
    console.log(`\n=== ZigZag page for ${name} fetched successfully ===`);
    
    // Let's find any images in the HTML containing 'product' or 'cache' or similar
    const imgRegex = /src="([^"]+)"/g;
    let match;
    const images = [];
    while ((match = imgRegex.exec(html)) !== null) {
      if (match[1].includes("product") || match[1].includes("cache") || match[1].includes("catalog") || match[1].includes("media")) {
        images.push(match[1]);
      }
    }
    console.log(`Found product images for ${name}:`);
    images.forEach(img => console.log(`- ${img}`));
    
    // Print lines containing image elements
    const lines = html.split('\n');
    lines.forEach(line => {
      if (line.includes("<img ") && (line.includes("product") || line.includes("catalog") || line.includes("cache"))) {
        console.log(`Img Line: ${line.trim()}`);
      }
    });
  } catch (err) {
    console.error(err);
  }
}

async function run() {
  await fetchZigZagCover("palomita-blanca", "Palomita blanca");
  await fetchZigZagCover("hijo-de-ladron", "Hijo de ladrón");
}
run();
