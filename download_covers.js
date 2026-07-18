import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const coversToDownload = {
  "hijo_de_ladron_1": "https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1349063249i/1360057.jpg",
  "hijo_de_ladron_2": "https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1454170813i/28807090.jpg",
  "hijo_de_ladron_3": "https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1510639899i/36592233.jpg",
  "hijo_de_ladron_4": "https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1677810477i/22237072.jpg",
  
  "palomita_blanca_1": "https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1421002594i/24445454.jpg",
  "palomita_blanca_2": "https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1677851255i/58231221.jpg",
  
  "martin_rivas_1": "https://upload.wikimedia.org/wikipedia/commons/9/9e/Portada_Martin_Rivas.jpg",
  "martin_rivas_2": "https://upload.wikimedia.org/wikipedia/commons/e/e0/Martin_Rivas.jpg",
  "martin_rivas_3": "https://covers.openlibrary.org/b/id/15013218-L.jpg"
};

async function downloadFile(url, targetPath) {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.log(`Failed to download ${url}: status ${res.status}`);
      return false;
    }
    const buffer = await res.arrayBuffer();
    fs.writeFileSync(targetPath, Buffer.from(buffer));
    console.log(`Downloaded ${url} to ${targetPath} (${buffer.byteLength} bytes)`);
    return true;
  } catch (err) {
    console.error(`Error downloading ${url} to ${targetPath}: ${err.message}`);
    return false;
  }
}

async function run() {
  const dir = path.join(__dirname, 'public', 'covers');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  for (const [name, url] of Object.entries(coversToDownload)) {
    const ext = url.endsWith('.png') ? '.png' : '.jpg';
    const targetPath = path.join(dir, `${name}${ext}`);
    await downloadFile(url, targetPath);
  }
}

run();
