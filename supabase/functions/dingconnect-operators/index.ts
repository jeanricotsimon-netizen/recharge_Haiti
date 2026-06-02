import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const API_KEY = Deno.env.get('DINGCONNECT_API_KEY') || 'JfNdAJhSeYv6rmZbB0XEUa';

async function fetchOperators(countryCode: string) {
  const response = await fetch(
    `https://api.dingconnect.com/api/V1/GetProducts?countryIsos=${countryCode}`,
    {
      headers: {
        'api_key': API_KEY,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch operators: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  if (data.ResultCode !== 1) {
    throw new Error(`API returned error code: ${data.ResultCode}`);
  }

  const items = (data.Items || []).map((item: any) => ({
    ...item,
    UatNumber: item.UatNumber || null
  }));

  return items;
}

async function getBalance() {
  const res = await fetch('https://api.dingconnect.com/api/V1/GetBalance', {
    headers: { 'api_key': API_KEY, 'Content-Type': 'application/json' }
  });
  return await res.json();
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    let requestBody;
    try {
      const requestText = await req.text();
      requestBody = requestText ? JSON.parse(requestText) : {};
    } catch {
      requestBody = {};
    }

    const countryCode = requestBody.countryCode || 'HT';
    const action = requestBody.action || '';

    if (action === 'balance' || countryCode === 'balance') {
      const keySource = Deno.env.get('DINGCONNECT_API_KEY') ? 'secret' : 'fallback';
      const keyPreview = API_KEY.substring(0, 6) + '...' + API_KEY.slice(-4);
      const balance = await getBalance();
      return new Response(JSON.stringify({ keySource, keyPreview, balance }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const operators = await fetchOperators(countryCode);

    return new Response(
      JSON.stringify({
        success: true,
        data: operators,
        countryCode: countryCode,
        count: operators.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
