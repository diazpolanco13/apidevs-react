import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/ai/balance
 * Obtiene el balance y uso de la cuenta de OpenRouter
 */
export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        message: 'OpenRouter API key not configured',
      }, { status: 500 });
    }

    // Llamar a la API de OpenRouter para obtener los créditos
    // Usamos /auth/key para info general (uso, tier, etc.)
    const keyResponse = await fetch('https://openrouter.ai/api/v1/auth/key', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        'X-Title': 'APIDevs Trading Platform',
      },
    });

    if (!keyResponse.ok) {
      const errorData = await keyResponse.json().catch(() => ({}));
      console.error('OpenRouter API error:', errorData);
      return NextResponse.json({
        success: false,
        message: errorData.error?.message || 'Failed to fetch from OpenRouter',
      }, { status: keyResponse.status });
    }

    const keyData = await keyResponse.json();
    console.log('🔍 OpenRouter Key Info:', JSON.stringify(keyData, null, 2));

    // Llamar al endpoint de créditos para obtener el balance real
    const creditsResponse = await fetch('https://openrouter.ai/api/v1/credits', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        'X-Title': 'APIDevs Trading Platform',
      },
    });

    if (!creditsResponse.ok) {
      const errorData = await creditsResponse.json().catch(() => ({}));
      console.error('OpenRouter Credits API error:', errorData);
      return NextResponse.json({
        success: false,
        message: errorData.error?.message || 'Failed to fetch credits from OpenRouter',
      }, { status: creditsResponse.status });
    }

    const creditsData = await creditsResponse.json();
    console.log('💳 OpenRouter Credits Response:', JSON.stringify(creditsData, null, 2));

    // Estructura del endpoint /credits:
    // total_credits - Total de créditos adquiridos
    // total_usage - Total consumido
    // balance = total_credits - total_usage
    
    const totalCredits = creditsData.data?.total_credits || 0;
    const totalUsage = creditsData.data?.total_usage || 0;
    const availableBalance = Math.max(0, totalCredits - totalUsage);

    // Obtener info de uso del endpoint /auth/key
    const usage = keyData.data?.usage || 0;
    const usageDaily = keyData.data?.usage_daily || 0;
    const usageWeekly = keyData.data?.usage_weekly || 0;
    const usageMonthly = keyData.data?.usage_monthly || 0;
    const isFree = keyData.data?.is_free_tier || false;

    const balance = {
      balance: availableBalance, // Saldo disponible (total_credits - total_usage)
      usage: totalUsage, // Uso total acumulado
      limit: totalCredits, // Total de créditos comprados
      is_free_tier: isFree,
      usage_breakdown: {
        daily: usageDaily,
        weekly: usageWeekly,
        monthly: usageMonthly,
      },
      rate_limit: {
        requests: keyData.data?.rate_limit?.requests || 0,
        interval: keyData.data?.rate_limit?.interval || 'minute',
      },
      // Info adicional para debugging
      raw_data: {
        total_credits: totalCredits,
        total_usage: totalUsage,
        key_usage: usage,
      }
    };

    console.log('💰 Balance calculado:', balance);

    return NextResponse.json({
      success: true,
      balance,
    });

  } catch (error) {
    console.error('Error fetching OpenRouter balance:', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error',
    }, { status: 500 });
  }
}

