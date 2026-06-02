import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: corsHeaders })

  try {
    const secretKey = Deno.env.get('DINGCONNECT_API_KEY')
    const fallbackKey = 'JfNdAJhSeYv6rmZbB0XEUa'
    const activeKey = secretKey || fallbackKey
    const keySource = secretKey ? 'secret:DINGCONNECT_API_KEY' : 'hardcoded_fallback'
    const keyPreview = activeKey.substring(0, 6) + '...' + activeKey.slice(-4)

    const res = await fetch('https://api.dingconnect.com/api/V1/GetBalance', {
      headers: { 'api_key': activeKey, 'Content-Type': 'application/json' }
    })
    const balanceData = await res.json()

    // Also test fallback if secret exists
    let fallbackBalance = null
    if (secretKey && secretKey !== fallbackKey) {
      const res2 = await fetch('https://api.dingconnect.com/api/V1/GetBalance', {
        headers: { 'api_key': fallbackKey, 'Content-Type': 'application/json' }
      })
      fallbackBalance = await res2.json()
    }

    return new Response(JSON.stringify({
      keySource,
      keyPreview,
      activeBalance: balanceData,
      fallbackBalance,
    }, null, 2), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
