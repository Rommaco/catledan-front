import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(request: NextRequest) {
  try {
    // Leer el archivo del Service Worker básico
    const swPath = join(process.cwd(), 'public', 'sw-basic.js');
    const swContent = await readFile(swPath, 'utf-8');
    
    return new NextResponse(swContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'public, max-age=0, must-revalidate',
        'Service-Worker-Allowed': '/',
      },
    });
  } catch (error) {
    console.error('Error serving Service Worker:', error);
    return new NextResponse('Service Worker not found', { status: 404 });
  }
}
