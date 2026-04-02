export const prerender = false;

import type { APIRoute } from 'astro';

const BEEHIIV_API_KEY = import.meta.env.BEEHIIV_API_KEY || 'EXPNWQ4vBsVLUE7roIzAOQ8TWxD58CnrPi88HidbUvXhAfy6CSGKHs1LF2VBFivz';
const PUBLICATION_ID = 'pub_da041fd5-70c0-4270-9e19-0df6757e0218';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({ error: 'Valid email required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const response = await fetch(
      `https://api.beehiiv.com/v2/publications/${PUBLICATION_ID}/subscriptions`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${BEEHIIV_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          reactivate_existing: true,
          send_welcome_email: true
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('Beehiiv error:', error);
      return new Response(JSON.stringify({ error: 'Subscription failed' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const result = await response.json();
    return new Response(JSON.stringify({ success: true, data: result }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('Newsletter subscribe error:', err);
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
