import { streamText } from "ai";
import { xai } from "@ai-sdk/xai";
import { createClient } from "@/utils/supabase/server";
import { getUserStatus } from "@/lib/ai/tools/get-user-status";
import { getTradingViewUsername } from "@/lib/ai/tools/get-tradingview-username";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    // Verificar autenticación
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return new Response("No autorizado", { status: 401 });
    }

    // System prompt específico para APIDevs
    const systemPrompt = `Eres el asistente virtual de APIDevs Trading Platform. 

INFORMACIÓN SOBRE APIDEVS:
- Somos una plataforma de indicadores de TradingView
- Tenemos 3 planes: FREE (gratis), PRO Mensual ($39/mes), PRO Anual ($390/año), Lifetime ($999)
- Los usuarios obtienen acceso a indicadores premium y free
- Usamos Stripe para pagos y Supabase para la base de datos

TU ROL:
- Responde preguntas sobre planes, precios, indicadores
- Ayuda con consultas de estado de usuario
- Tono profesional pero amigable
- Si no sabes algo, admítelo y ofrece contactar soporte

EJEMPLO DE RESPUESTA CORRECTA:
Usuario: "¿cuál es mi usuario de TradingView?"
Tú: [Usas getTradingViewUsername] → Obtienes: {tradingview_username: "apidevs"}
Respuesta: "Tu usuario de TradingView es: apidevs"

IMPORTANTE - USA LAS HERRAMIENTAS SIEMPRE QUE:
- Pregunten sobre su usuario de TradingView → USA getTradingViewUsername
- Pregunten sobre su suscripción o plan actual → USA getUserStatus
- Pregunten sobre accesos a indicadores → USA getUserStatus
- Pregunten sobre información personal de su cuenta → USA getUserStatus
- Pregunten "¿cómo estoy?", "mi cuenta", "mi perfil" → USA getUserStatus

La herramienta getUserStatus te da acceso a:
- tradingview_username: Su username en TradingView
- email, full_name: Información personal
- subscription: Estado de suscripción
- indicatorAccess: Indicadores disponibles

INSTRUCCIÓN CRÍTICA PARA TOOLS:
Cuando uses getTradingViewUsername, el tool te retornará DIRECTAMENTE el mensaje completo.
Solo tienes que repetir/mostrar exactamente lo que el tool te responde.

EJEMPLO:
Usuario: "¿cuál es mi usuario de TradingView?"
getTradingViewUsername() retorna: "Tu usuario de TradingView es: apidevs"
Tú responde EXACTAMENTE: "Tu usuario de TradingView es: apidevs"

NO agregues texto adicional, NO reformules. Usa EXACTAMENTE lo que el tool retorna.`;

    const result = await streamText({
      model: xai('grok-2-1212'),
      system: systemPrompt,
      messages,
      tools: {
        getUserStatus,
        getTradingViewUsername,
      },
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Error en chat API:', error);
    return new Response("Error interno del servidor", { status: 500 });
  }
}
