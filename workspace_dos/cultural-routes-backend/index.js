const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
// Cargar variables de entorno solo si no están definidas (útil para desarrollo local)
if (!process.env.GEMINI_API_KEY) {
  require('dotenv').config({ path: '../.env' });
}

const app = express();
app.use(cors());
app.use(express.json());

// Ruta de bienvenida para verificar que el servidor funciona
app.get('/', (req, res) => {
  res.send('🚀 Servidor de Rutas Culturales Chilenas activo y listo.');
});

// Inicializar Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/generate-experience', async (req, res) => {
  try {
    const { 
      content_type, 
      title, 
      author_director, 
      location_name, 
      city, 
      time_period, 
      base_text, 
      characters, 
      platform, 
      theme 
    } = req.body;

    const prompt = `
Eres un experto en narrativa cultural chilena, especializado en literatura, cine y experiencias urbanas inmersivas.

Tu misión es transformar contenido cultural en una experiencia interactiva basada en ubicaciones reales en Chile.

Debes ejecutar los siguientes 7 pasos de forma estructurada y coherente.

---
### CONTEXTO DE ENTRADA
- Tipo de contenido: ${content_type || 'No especificado'}
- Título: ${title}
- Autor o director: ${author_director || 'No especificado'}
- Ubicación: ${location_name || 'Ubicación local chilena'}
- Ciudad: ${city || 'Santiago (u otra ciudad principal)'}
- Época: ${time_period || 'Época contemporánea'}
- Texto base o escena: ${base_text || 'Escena icónica del contenido'}
- Personajes: ${characters || 'Protagonistas principales'}
- Plataforma: ${platform || 'web'}
- Tema: ${theme || 'Cultural'}
---

# PASO 1: CONTEXTUALIZACIÓN CULTURAL
Explica brevemente el contexto de la obra en Chile:
- Importancia cultural
- Relación con la ciudad o lugar
- Por qué es relevante para estudiantes

# PASO 2: EXPANSIÓN NARRATIVA INMERSIVA
Genera una versión expandida del contenido:
- Si es LIBRO → mantener estilo literario
- Si es PELÍCULA → describir como escena visual
Incluir:
- Detalles sensoriales (sonido, ambiente, emociones)
- Relación con el entorno urbano real

# PASO 3: EXPERIENCIA EN SEGUNDA PERSONA
Convierte la historia en una experiencia directa:
- Usa formato: “Estás en…”
- Haz que el usuario sienta que está en el lugar
- Máximo 2–3 párrafos

# PASO 4: INTERACCIÓN CON PERSONAJE
Simula una interacción breve con un personaje:
- Mantener personalidad coherente
- Formato diálogo corto:
Personaje:
“...”

# PASO 5: GENERACIÓN DE RUTA CULTURAL
Crea una mini ruta relacionada:
- 3 lugares en la ciudad
- Cada uno debe incluir: Lugar, Obra (libro o película), Por qué es relevante

# PASO 6: ADAPTACIÓN PARA AUDIO INMERSIVO
Reescribe la experiencia para audio:
- Frases cortas, Ritmo natural, Pausas, Lenguaje fluido para escuchar

# REGLAS GENERALES
1. Mantener fidelidad cultural chilena
2. Evitar contenido genérico
3. Priorizar aprendizaje + entretenimiento
4. Lenguaje accesible para estudiantes

# FORMATO DE SALIDA
Debes de darnos EXACTAMENTE un objeto JSON donde cada módulo es una propiedad distinta para poder renderizarlo fácilmente en React. NO incluyas markdown como \`\`\`json. Sólo el JSON puro válido.
{
  "contexto": "texto del paso 1",
  "historia": "texto del paso 2",
  "inmersiva": "texto del paso 3",
  "personaje_nombre": "nombre del personaje",
  "personaje_dialogo": "texto del diálogo paso 4",
  "ruta": [
    { "lugar": "Nombre 1", "obra": "Obra referida", "relevancia": "texto relev." },
    { "lugar": "Nombre 2", "obra": "Obra referida", "relevancia": "texto relev." },
    { "lugar": "Nombre 3", "obra": "Obra referida", "relevancia": "texto relev." }
  ],
  "audio": "texto para el locutor paso 6"
}
    `;

    // Usamos gemini-flash-latest de acuerdo a los modelos de la API Key disponible
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const result = await model.generateContent(prompt);
    let text = result.response.text();
    
    // Limpiamos la respuesta en caso de que envíe markdown con formato
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const jsonResult = JSON.parse(text);

    res.json(jsonResult);
  } catch (error) {
    console.error("Error generating experience:", error);
    res.status(500).json({ error: "No se pudo generar la experiencia. Verifica tu conexión o tu API Key de Gemini." });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log('Servidor de Gemini ejecutándose en http://localhost:' + PORT);
});
