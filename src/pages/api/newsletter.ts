export const prerender = false;

import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { email, name } = data;

    // Validate email
    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({ error: 'Please enter a valid email address.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = import.meta.env.SUPABASE_URL;
    const supabaseKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase credentials not configured');
      return new Response(JSON.stringify({ error: 'Server configuration error.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get IP address for spam tracking (optional)
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : request.headers.get('x-real-ip') || null;

    // Upsert subscriber (handles duplicates gracefully)
    const { data: subscriber, error } = await supabase
      .from('newsletter_subscribers')
      .upsert(
        {
          email: email.toLowerCase().trim(),
          name: name?.trim() || null,
          status: 'active',
          source: 'website',
          ip_address: ip,
          subscribed_at: new Date().toISOString(),
        },
        {
          onConflict: 'email',
          ignoreDuplicates: false,
        }
      )
      .select()
      .single();

    if (error) {
      // Check if it's a duplicate (already subscribed)
      if (error.code === '23505' || error.message?.includes('duplicate')) {
        return new Response(JSON.stringify({ 
          success: true, 
          message: "You're already subscribed! Thanks for your interest." 
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      console.error('Newsletter signup error:', error);
      return new Response(JSON.stringify({ error: 'Failed to subscribe. Please try again.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: "You're in! Watch your inbox for the latest Jackson County news." 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('Newsletter signup error:', err);
    return new Response(JSON.stringify({ error: 'Something went wrong. Please try again.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
