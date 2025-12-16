import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, Authorization',
  'Content-Type': 'application/json',
};

// IndexNow key - you'll need to create a file at https://carstreet.ca/{key}.txt with the key inside
const INDEXNOW_KEY = 'carstreet-indexnow-key-2024';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { urls, type } = await req.json();

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return new Response(JSON.stringify({ error: 'No URLs provided' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const siteUrl = 'https://carstreet.ca';

    // Format URLs properly
    const formattedUrls = urls.map((url: string) =>
      url.startsWith('http') ? url : `${siteUrl}${url}`
    );

    console.log(`Submitting ${formattedUrls.length} URLs to IndexNow:`, formattedUrls);

    // Submit to IndexNow (Bing, Yandex, etc.)
    const indexNowPayload = {
      host: 'carstreet.ca',
      key: INDEXNOW_KEY,
      keyLocation: `${siteUrl}/${INDEXNOW_KEY}.txt`,
      urlList: formattedUrls,
    };

    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(indexNowPayload),
    });

    const responseStatus = response.status;
    let responseText = '';
    try {
      responseText = await response.text();
    } catch (e) {
      // Ignore if can't read response
    }

    console.log(`IndexNow response: ${responseStatus}`, responseText);

    // Also submit to Google (they support IndexNow via their own endpoint)
    // Note: Google prefers Search Console, but IndexNow is supported

    return new Response(JSON.stringify({
      success: responseStatus >= 200 && responseStatus < 300,
      status: responseStatus,
      message: `Submitted ${formattedUrls.length} URLs to IndexNow`,
      urls: formattedUrls,
      type: type || 'manual'
    }), {
      headers: corsHeaders,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('IndexNow submission error:', error);
    return new Response(JSON.stringify({
      error: errorMessage,
      success: false
    }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
