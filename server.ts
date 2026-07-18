import express from 'express';
import cors from 'cors';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { curatedFallbacks, getDynamicFallback } from './src/fallbackExperiences';

dotenv.config();

// Initialize Gemini with safety and proper telemetry User-Agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// API Route for generating experiences
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

    if (!title) {
      return res.status(400).json({ error: "El título es obligatorio." });
    }

    // 1. Try curated fallbacks first (case-insensitive, trims white spaces)
    const normalizedTitle = title.toLowerCase().trim();
    if (curatedFallbacks[normalizedTitle]) {
      console.log(`[AI Studio] Servido desde base de fallbacks curados: "${title}"`);
      return res.json(curatedFallbacks[normalizedTitle]);
    }

    // 2. Try Gemini API generation if key is available
    const apiKey = (req.headers['x-gemini-key'] as string) || process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const requestAi = new GoogleGenAI({
          apiKey: apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });

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
- Haz que el usuario sientan que está en el lugar
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

        const response = await requestAi.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json'
          }
        });

        let text = response.text;
        if (text) {
          // Clean markdown wrappers if any
          text = text.replace(/```json/g, '').replace(/```/g, '').trim();
          const jsonResult = JSON.parse(text);
          return res.json(jsonResult);
        }
      } catch (geminiError: any) {
        console.error("[AI Studio] Error llamando a Gemini, usando generador dinámico alternativo:", geminiError);
        // Fallback to dynamic generator if Gemini call failed (e.g. quota limit, transient error)
        const fallback = getDynamicFallback(req.body);
        return res.json(fallback);
      }
    }

    // 3. Fallback to dynamic generator if no API key is set
    console.log(`[AI Studio] No se detectó clave API, sirviendo desde generador dinámico alternativo para: "${title}"`);
    const fallback = getDynamicFallback(req.body);
    return res.json(fallback);

  } catch (error: any) {
    console.error("Error crítico en endpoint generate-experience:", error);
    // Even if everything breaks, return a safe dynamic fallback so the page never displays 500
    try {
      const fallback = getDynamicFallback(req.body || {});
      return res.json(fallback);
    } catch (nestedError) {
      res.status(500).json({ 
        error: error.message || "No se pudo generar la experiencia con la IA. Inténtalo de nuevo." 
      });
    }
  }
});

// Setup Vite middleware or static files depending on the environment
async function setupVite() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[AI Studio] Server running on http://localhost:${PORT}`);
  });
}

setupVite();
