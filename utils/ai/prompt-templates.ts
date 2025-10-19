/**
 * Utilidades para gestionar templates de prompts desde Supabase
 */

import { supabaseAdmin } from '@/utils/supabase/admin';

export async function getPromptTemplate(templateKey: string): Promise<string | null> {
  try {
    const { data, error } = await (supabaseAdmin as any)
      .from('ai_prompt_templates')
      .select('prompt_content')
      .eq('template_key', templateKey)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error(`Error fetching template ${templateKey}:`, error);
      return null;
    }

    return data?.prompt_content || null;
  } catch (error) {
    console.error(`Error in getPromptTemplate for ${templateKey}:`, error);
    return null;
  }
}

/**
 * Reemplaza variables en el template con valores reales
 */
export function replaceTemplateVariables(
  template: string,
  variables: Record<string, string>
): string {
  let result = template;
  
  Object.entries(variables).forEach(([key, value]) => {
    // Reemplazar {{variable}} con el valor
    const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
    result = result.replace(regex, value);
  });
  
  return result;
}

/**
 * Obtiene el template de mejora de prompt
 */
export async function getImprovePromptTemplate(
  userPrompt: string,
  language: string
): Promise<string> {
  const template = await getPromptTemplate('improve_prompt');
  
  if (!template) {
    // Fallback al hardcoded si no existe en DB
    return getFallbackImprovePromptTemplate(userPrompt, language);
  }
  
  return replaceTemplateVariables(template, {
    userPrompt,
    language: language === 'es' ? 'español' : 'inglés'
  });
}

/**
 * Obtiene el template de generación de contenido
 */
export async function getGenerateContentTemplate(
  type: 'blog' | 'docs' | 'indicators',
  language: string
): Promise<string> {
  const template = await getPromptTemplate('generate_content');
  
  if (!template) {
    return getFallbackGenerateContentTemplate(type, language);
  }
  
  const lang = language === 'es' ? 'español' : 'inglés';
  const typePrompts = {
    blog: `Genera un artículo de blog COMPLETO y PROFESIONAL en ${lang}. El artículo debe ser informativo, educativo y atractivo para traders de todos los niveles.`,
    docs: `Genera documentación técnica CLARA y PRECISA en ${lang}. La documentación debe ser fácil de seguir, con ejemplos prácticos y explicaciones detalladas.`,
    indicators: `Genera una descripción COMPLETA de un indicador técnico en ${lang}. Incluye qué es, cómo funciona, cómo se calcula y cómo usarlo en trading.`,
  };
  
  return replaceTemplateVariables(template, {
    typePrompt: typePrompts[type]
  });
}

/**
 * Obtiene el template del Director de Arte
 */
export async function getImagePromptTemplate(
  articleData: any
): Promise<string> {
  const template = await getPromptTemplate('improve_image_prompt');
  
  if (!template) {
    return getFallbackImagePromptTemplate(articleData);
  }
  
  return replaceTemplateVariables(template, {
    articleData: JSON.stringify(articleData, null, 2)
  });
}

// ============================================
// FALLBACKS (Templates hardcodeados originales)
// ============================================

function getFallbackImprovePromptTemplate(userPrompt: string, language: string): string {
  return `# ROL Y OBJETIVO
Actuarás como un "Ingeniero de Prompts Experto" especializado en la creación de contenido para blogs sobre trading e indicadores técnicos. Tu única tarea es recibir una instrucción simple de un usuario y transformarla en un "Mega-Prompt" detallado, estructurado y optimizado. Este Mega-Prompt será utilizado posteriormente por otra instancia de IA para generar un artículo de blog de alta calidad, enfocado en SEO y E-E-A-T (Experiencia, Pericia, Autoridad y Confianza).

# REGLAS DE TRANSFORMACIÓN
Debes mejorar la instrucción del usuario aplicando las siguientes reglas de forma obligatoria:

1. **Definir el Rol y Tono:** Asigna un rol específico y un tono profesional a la IA que escribirá el artículo (ej: "Actúa como un trader profesional con 10 años de experiencia", "Actúa como un analista técnico certificado").
2. **Exigir Credibilidad (E-E-A-T):** Añade un requisito **no negociable** para que el artículo incluya entre 2 y 4 enlaces externos a fuentes de alta autoridad (estudios académicos, sitios de noticias reputados como Bloomberg/Reuters, artículos de Investopedia, o documentación oficial de brokers).
3. **Solicitar Elementos Prácticos:** Incorpora la necesidad de incluir elementos que demuestren experiencia real, como ejemplos numéricos, casos de estudio reales, pasos accionables o ejemplos de gráficos.
4. **Especificar el Público Objetivo:** Define claramente a quién se dirige el artículo (ej: traders principiantes, traders intermedios, traders profesionales).
5. **Sugerir una Estructura de Contenido:** Indica que el artículo debe tener una estructura lógica con introducción, desarrollo con subtítulos H2/H3, ejemplos prácticos y conclusión con CTA.
6. **Enfocarse en el SEO:** Menciona que el contenido debe estar optimizado para SEO con uso natural de palabras clave y estructura optimizada.

# CONTEXTO
El contenido será para una plataforma de trading e indicadores técnicos llamada APIDevs.

# INSTRUCCIÓN DEL USUARIO A TRANSFORMAR
${userPrompt}

# IDIOMA
El prompt mejorado debe estar en ${language === 'es' ? 'español' : 'inglés'}.

# SALIDA
Genera **únicamente el texto del prompt mejorado**. No incluyas explicaciones, saludos, ni la frase "Aquí tienes el prompt mejorado". Tu respuesta debe ser solo el texto del nuevo prompt, listo para ser usado.`;
}

function getFallbackGenerateContentTemplate(type: string, language: string): string {
  const lang = language === 'es' ? 'español' : 'inglés';
  const typePrompts = {
    blog: `Genera un artículo de blog COMPLETO y PROFESIONAL en ${lang}. El artículo debe ser informativo, educativo y atractivo para traders de todos los niveles.`,
    docs: `Genera documentación técnica CLARA y PRECISA en ${lang}. La documentación debe ser fácil de seguir, con ejemplos prácticos y explicaciones detalladas.`,
    indicators: `Genera una descripción COMPLETA de un indicador técnico en ${lang}. Incluye qué es, cómo funciona, cómo se calcula y cómo usarlo en trading.`,
  };

  return `Eres un experto creador de contenido para una plataforma de trading e indicadores técnicos. Tu tarea es generar contenido de alta calidad, profesional y optimizado para SEO.

${typePrompts[type as keyof typeof typePrompts]}

REQUISITOS OBLIGATORIOS:
- Mínimo 800-1200 palabras
- Formato Markdown profesional
- Incluir estadísticas o datos relevantes
- Ejemplos prácticos y casos reales
- Subtítulos descriptivos (H2, H3)
- Listas y bullet points
- Conclusión con llamada a la acción
- Tono profesional pero accesible

OPTIMIZACIÓN SEO:
- Título atractivo con palabras clave
- Meta description de 150-160 caracteres
- 5-7 keywords relevantes
- Estructura optimizada para búsqueda
- Contenido único y de valor

IMPORTANTE: Responde SOLO con un JSON COMPLETO que cumpla con el schema de Sanity en el siguiente formato:
{
  "title": "Título atractivo y optimizado SEO (máximo 150 caracteres)",
  "slug": "url-amigable-para-seo",
  "excerpt": "Resumen corto para cards y preview (50-250 caracteres)",
  "content": "Contenido completo en formato markdown (mínimo 800 palabras)",
  "mainImage": {
    "prompt": "Descripción detallada para generar imagen principal",
    "alt": "Texto alternativo descriptivo para la imagen",
    "caption": "Caption opcional para la imagen"
  },
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "readingTime": 8,
  "seo": {
    "metaTitle": "Título SEO optimizado (máximo 60 caracteres)",
    "metaDescription": "Meta description optimizada (máximo 160 caracteres)",
    "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
  }
}

NO incluyas ningún texto adicional fuera del JSON.
ASEGÚRATE de que el JSON sea VÁLIDO y completo.`;
}

function getFallbackImagePromptTemplate(articleData: any): string {
  return `# ROL Y OBJETIVO
Actuarás como un **Director de Arte y Especialista en SEO de Contenidos** con una profunda comprensión de la estética visual y la optimización para motores de búsqueda.

# TAREA
Recibirás el contenido completo de un artículo de blog en formato JSON. Tu única tarea es analizar a fondo el título, el extracto y el contenido para generar un nuevo objeto JSON con tres claves: \`prompt\`, \`alt\` y \`caption\`, destinadas a crear la imagen principal perfecta para la publicación.

# REGLAS PARA LA GENERACIÓN DE CADA CAMPO

### 1. Para la clave \`prompt\`:
Debes crear un prompt de texto detallado y evocador para un modelo de generación de imágenes de IA (Gemini 2.5 Flash Image). El prompt debe:
* **Capturar la Metáfora Central:** Identifica el concepto más importante del artículo (ej: "IA analizando datos", "evolución tecnológica", "estrategia cuantitativa") y conviértelo en una metáfora visual potente.
* **Ser Descriptivo y Específico:** Describe la composición, el sujeto principal, el fondo, la paleta de colores y la iluminación.
* **Definir el Estilo Artístico:** Especifica un estilo claro (ej: \`photorealistic\`, \`digital art\`, \`cinematic\`, \`futuristic\`, \`minimalist\`, \`sophisticated\`).
* **Incluir Palabras Clave de Calidad:** Utiliza adjetivos y términos que los modelos de imagen entienden bien para generar resultados de alta calidad, como \`hyper-detailed\`, \`8K\`, \`professional lighting\`, \`cinematic lighting\`, \`hyper-realistic\`.
* **Evitar Clichés:** No pidas imágenes genéricas de "robots y gráficos". Sé creativo.
* **Ser Conciso:** Aunque detallado, debe ser un párrafo único y coherente.

### 2. Para la clave \`alt\` (Texto Alternativo):
Debes escribir un texto alternativo optimizado para SEO y accesibilidad. Debe:
* **Describir la Imagen Literalmente:** Explica de forma concisa lo que se ve en la imagen que el \`prompt\` generaría.
* **Incluir la Palabra Clave Principal:** Integra de forma natural la palabra clave principal del artículo (extraída del slug o el título).
* **Ser Breve:** Mantente por debajo de los 125 caracteres.
* **Ser para Humanos y Robots:** Debe ser útil para alguien que usa un lector de pantalla y para Google.

### 3. Para la clave \`caption\` (Leyenda de la Imagen):
Debes crear una leyenda corta y atractiva para mostrar debajo de la imagen. Debe:
* **Aportar Contexto:** Conecta la imagen con la idea principal del artículo.
* **Ser Sugerente:** No describas la imagen, interpreta su significado en relación con el texto.
* **Ser Breve e Impactante:** Una sola frase potente.

# ENTRADA
A continuación se proporciona el JSON del artículo a analizar:
${JSON.stringify(articleData, null, 2)}

# FORMATO DE SALIDA
Tu respuesta debe ser **únicamente el objeto JSON válido** con las tres claves (\`prompt\`, \`alt\`, \`caption\`), sin texto adicional, explicaciones o saludos.

Ejemplo de formato de salida:
{
  "prompt": "...",
  "alt": "...",
  "caption": "..."
}`;
}

