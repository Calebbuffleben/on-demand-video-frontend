import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { videoId } = req.query;

  if (!videoId || typeof videoId !== 'string') {
    return res.status(400).json({ error: 'Video ID is required' });
  }

  try {
    // Validate environment variables
    if (!process.env.CLOUDFLARE_ACCOUNT_ID || !process.env.CLOUDFLARE_API_TOKEN) {
      console.error('Missing Cloudflare credentials');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Call Cloudflare API to get video status
    const response = await axios.get(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/stream/${videoId}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
        },
      }
    );

    if (!response.data.success) {
      console.error('Cloudflare API error:', response.data.errors);
      return res.status(500).json({ error: 'Failed to get video status from Cloudflare' });
    }

    const videoData = response.data.result;
    
    // Return a simplified response with the video data
    return res.status(200).json({
      success: true,
      readyToStream: videoData.readyToStream || false,
      status: videoData.status ? videoData.status.state : 'processing',
      video: {
        uid: videoData.uid,
        readyToStream: videoData.readyToStream || false,
        thumbnail: videoData.thumbnail,
        playback: {
          hls: videoData.playback?.hls || '',
          dash: videoData.playback?.dash || '',
        },
        created: videoData.created,
        duration: videoData.duration,
        status: videoData.status,
      },
    });
  } catch (error) {
    console.error('Error getting video status:', error);
    
    // Handle 404 errors specifically
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return res.status(404).json({ error: 'Video not found' });
    }
    
    return res.status(500).json({ error: 'Failed to get video status' });
  }
} 