// Vercel serverless function — sugiere cómo procesar un ítem del inbox usando
// TypeSafe (modelo Jev). En vez de generar texto, Jev responde preguntas tipadas
// con probabilidades; el código decide qué sugerencias usar según la confianza.
// La API key vive SOLO del lado servidor (env var TYPESAFE_API_KEY en Vercel).

const MODEL = 'jev-latest'
const NO_PROJECT = 'sin proyecto'

// Deben coincidir con las opciones de ProcessModal.jsx
const PILLARS = ['Estrategia', 'Comercial', 'Marca', 'Eventos', 'EOS', 'Tecnología', 'Consejo', 'Otro']

// Debajo de este umbral no se precarga el campo (el usuario decide).
// Punto de partida: ajustar observando resultados reales.
const MIN_CONFIDENCE = 0.5

function buildQuestions(projects) {
  const projectCriteria = { [NO_PROJECT]: 'El ítem no pertenece claramente a ninguno de los proyectos activos listados' }
  for (const p of projects) {
    projectCriteria[p.name] = [p.pillar && `Pilar: ${p.pillar}`, p.nextAction && `Próxima acción actual: ${p.nextAction}`]
      .filter(Boolean).join('. ') || null
  }

  // Todas las preguntas van en una sola llamada (corren en paralelo).
  // "project" solo se usa si el ítem es una acción; "pillar" solo si es un proyecto.
  return {
    type: {
      type: 'choice',
      instructions: 'Según la metodología GTD de David Allen, ¿qué es el ítem capturado en `item`?',
      criteria: {
        action: 'Una sola acción física concreta que se completa en un paso (llamar, enviar, revisar, agendar)',
        project: 'Un resultado deseado que requiere más de un paso para completarse',
      },
    },
    energy: {
      type: 'choice',
      instructions: 'Si `item` se trata como una acción, ¿cuánta energía mental requiere hacerla?',
      criteria: {
        high: 'Trabajo profundo o estratégico: pensar, crear, decidir, negociar',
        med: 'Trabajo normal: reuniones, llamadas, redactar algo corto',
        low: 'Trabajo mecánico o rápido: enviar, reenviar, agendar, pagar, archivar',
      },
    },
    project: {
      type: 'choice',
      instructions: 'Si `item` se trata como una acción, ¿a cuál de los proyectos activos del usuario pertenece?',
      criteria: projectCriteria,
    },
    pillar: {
      type: 'choice',
      instructions: 'Si `item` se trata como un proyecto, ¿a qué pilar del negocio del usuario corresponde?',
      criteria: {
        Estrategia: 'Planificación, dirección, OKRs, decisiones de negocio',
        Comercial: 'Ventas, clientes, propuestas, cotizaciones, pipeline',
        Marca: 'Marca personal, contenido, redes sociales, comunicación',
        Eventos: 'Charlas, talleres, conferencias, eventos',
        EOS: 'Sistema operativo del negocio, procesos, reuniones de equipo, métricas',
        Tecnología: 'Software, IA, automatización, herramientas, desarrollo',
        Consejo: 'Directorios, asesorías de consejo, gobierno corporativo',
        Otro: 'No calza con ningún pilar anterior',
      },
    },
  }
}

// Devuelve la opción elegida solo si la confianza supera el umbral.
function gated(answer) {
  if (!answer || answer.confidence < MIN_CONFIDENCE) return null
  return { value: answer.choice, confidence: answer.confidence }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method_not_allowed' })
  }

  const key = process.env.TYPESAFE_API_KEY
  if (!key) {
    return res.status(503).json({
      error: 'no_key',
      message: 'Falta configurar TYPESAFE_API_KEY en Vercel (Settings → Environment Variables).',
    })
  }

  const { text, projects } = req.body || {}
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'bad_request', message: 'Falta `text`.' })
  }
  const activeProjects = (Array.isArray(projects) ? projects : [])
    .filter((p) => p && typeof p.name === 'string' && p.name.trim() && p.name !== NO_PROJECT)
    .slice(0, 200)

  try {
    const r = await fetch('https://api.typesafe.ai/v1/systemone', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: MODEL,
        state: {
          usuario: 'JR Jottar, consultor estratégico en IA, tecnología y negocios (IB Solución Ltda., LATAM)',
          item: text.slice(0, 2000),
        },
        questions: buildQuestions(activeProjects),
      }),
    })

    if (!r.ok) {
      const detail = await r.text()
      return res.status(502).json({ error: 'typesafe_api_error', message: detail.slice(0, 500) })
    }

    const { answers = {} } = await r.json()
    const project = gated(answers.project)

    return res.status(200).json({
      // El tipo siempre se sugiere (el usuario ve ambos botones y puede cambiarlo).
      type: answers.type ? { value: answers.type.choice, confidence: answers.type.confidence } : null,
      energy: gated(answers.energy),
      project: project && project.value !== NO_PROJECT ? project : null,
      pillar: gated(answers.pillar),
    })
  } catch (e) {
    return res.status(500).json({ error: 'server_error', message: String(e).slice(0, 300) })
  }
}
