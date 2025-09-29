import { NextResponse } from 'next/server';

const TRADINGVIEW_API = 'http://185.218.124.241:5001';

export async function GET(
  request: Request,
  { params }: { params: { username: string } }
) {
  try {
    const username = params.username;

    if (!username || username.length < 3) {
      return NextResponse.json(
        { error: 'El usuario debe tener al menos 3 caracteres' },
        { status: 400 }
      );
    }

    // Llamar al microservicio desde el servidor (evita CORS)
    const response = await fetch(`${TRADINGVIEW_API}/profile/${username}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Error al obtener el perfil' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error fetching TradingView profile:', error);
    return NextResponse.json(
      { error: 'Error al conectar con el servicio de perfiles' },
      { status: 500 }
    );
  }
}
