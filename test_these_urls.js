const urls = {
  "Martin Rivas": "https://upload.wikimedia.org/wikipedia/commons/e/e0/Martin_Rivas.jpg",
  "Portada Martin Rivas": "https://upload.wikimedia.org/wikipedia/commons/9/9e/Portada_Martin_Rivas.jpg"
};

async function test() {
  for (const [name, url] of Object.entries(urls)) {
    try {
      const res = await fetch(url, { method: "HEAD" });
      console.log(`${name}: ${res.status}`);
    } catch (e) {
      console.log(`${name}: Error ${e.message}`);
    }
  }
}
test();
