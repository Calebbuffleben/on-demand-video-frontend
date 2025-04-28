import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { maxDurationSeconds = 3600 } = req.body; // Default to 1 hour max duration

    // Perform validation
    if (!process.env.CLOUDFLARE_ACCOUNT_ID || !process.env.CLOUDFLARE_API_TOKEN) {
      console.error('Missing Cloudflare credentials');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    if (maxDurationSeconds <= 0 || maxDurationSeconds > 21600) { // Max 6 hours
      return res.status(400).json({ error: 'Invalid maxDurationSeconds. Must be between 1 and 21600' });
    }

    // Call Cloudflare API to get a direct upload URL
    const response = await axios.post(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/stream/direct_upload`,
      {
        maxDurationSeconds,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.data.success) {
      console.error('Cloudflare API error:', response.data.errors);
      return res.status(500).json({ error: 'Failed to get upload URL from Cloudflare' });
    }

    // Return the upload URL and video ID to the client
    return res.status(200).json({
      uploadURL: response.data.result.uploadURL,
      uid: response.data.result.uid,
    });
  } catch (error) {
    console.error('Error getting upload URL:', error);
    return res.status(500).json({ error: 'Failed to get upload URL' });
  }
} 