import { createClient } from '@supabase/supabase-js';
import eventsDataFallback from '../data/events.json';

export interface SharedEvent {
  id: string;
  title: string;
  slug: string;
  status: string;
  content: string;
  date: string;
  end_date: string | null;
  start_time: string;
  end_time: string;
  recurring: string;
  venue: string;
  address: string;
  city: string;
  county: string;
  cost: string;
  phone: string;
  website: string;
  tags: string[];
  featured: boolean;
  image_url: string | null;
}

/**
 * Fetch approved events for a county from the shared Supabase events table.
 * Falls back to the local events.json if Supabase is unavailable.
 *
 * @param county - County key, e.g. 'jackson-ms'
 */
export async function getCountyEvents(county: string): Promise<SharedEvent[]> {
  const supabaseUrl = import.meta.env.SUPABASE_URL;
  const supabaseKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return mapFallbackEvents();
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('events')
      .select('id, title, slug, status, content, date, end_date, start_time, end_time, recurring, venue, address, city, county, cost, phone, website, tags, featured, image_url')
      .eq('county', county)
      .eq('status', 'approved')
      .gte('date', today)
      .order('featured', { ascending: false })
      .order('date', { ascending: true });

    if (error || !data || data.length === 0) {
      return mapFallbackEvents();
    }

    return data as SharedEvent[];
  } catch {
    return mapFallbackEvents();
  }
}

/**
 * Map legacy events.json format to SharedEvent interface for fallback.
 */
function mapFallbackEvents(): SharedEvent[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (eventsDataFallback as any[])
    .filter((e) => {
      if (e.status !== 'publish') return false;
      const eventDate = new Date(e.date + 'T00:00:00');
      return eventDate >= today;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((e) => ({
      id: String(e.id),
      title: e.title,
      slug: e.slug,
      status: 'approved',
      content: e.content || '',
      date: e.date,
      end_date: null,
      start_time: e.start_time || '',
      end_time: e.end_time || '',
      recurring: e.recurring || '',
      venue: e.venue || '',
      address: e.address || '',
      city: e.location || '',
      county: 'jackson-ms',
      cost: e.cost || '',
      phone: e.phone || '',
      website: e.website || '',
      tags: e.tags || [],
      featured: false,
      image_url: null,
    }));
}
