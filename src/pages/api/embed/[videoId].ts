import { NextApiRequest, NextApiResponse } from 'next';

// DEDICATED EMBED API ROUTE - COMPLETELY BYPASSES ALL AUTHENTICATION
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { videoId } = req.query;
  
  console.log('🎯 EMBED API ROUTE:', { videoId, method: req.method });
  
  // Set SUPER aggressive headers for iframe compatibility
  res.setHeader('X-Frame-Options', 'ALLOWALL');
  res.setHeader('Content-Security-Policy', 'frame-ancestors *; default-src *; script-src * \'unsafe-inline\' \'unsafe-eval\'; style-src * \'unsafe-inline\';');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('X-Embed-API', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  if (!videoId || typeof videoId !== 'string') {
    return res.status(400).json({ error: 'Invalid video ID' });
  }
  
  try {
    // Direct fetch to backend without ANY authentication
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
    const backendResponse = await fetch(`${backendUrl}/videos/embed/${videoId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'NextJS-Embed-API/1.0',
      },
    });
    
    const data = await backendResponse.json();
    
    console.log('🎬 EMBED API RESPONSE:', { 
      status: backendResponse.status, 
      success: data.success,
      hasResult: !!data.result 
    });
    
    // Return the exact same structure as backend
    return res.status(backendResponse.status).json(data);
    
  } catch (error) {
    console.error('❌ EMBED API ERROR:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch video data',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 