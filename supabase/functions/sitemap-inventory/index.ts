import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const siteUrl = 'https://carstreet.ca';

    // Fetch all available vehicles
    const { data: vehicles, error } = await supabase
      .from('vehicles')
      .select('id, make, model, year, updated_at')
      .eq('status', 'available')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching vehicles:', error);
      throw error;
    }

    const urlEntries = (vehicles || []).map(vehicle => {
      const lastmod = vehicle.updated_at 
        ? new Date(vehicle.updated_at).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];
      
      return `
  <url>
    <loc>${siteUrl}/vehicle/${vehicle.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    }).join('');

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;

    console.log(`Generated sitemap with ${vehicles?.length || 0} vehicles`);

    return new Response(sitemap, {
      headers: corsHeaders,
    });
  } catch (error) {
    console.error('Sitemap generation error:', error);
    return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`, {
      headers: corsHeaders,
    });
  }
});
