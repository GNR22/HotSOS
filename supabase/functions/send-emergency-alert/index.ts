import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  try {
    const { record } = await req.json()

    // 1. Fetch trusted contacts for this victim
    // (Note: You'll need to add logic here to fetch their push tokens later, 
    // but for now, we'll send it back to the victim's token to test)
    
    const message = {
      to: record.push_token, 
      sound: 'default',
      title: '🚨 HotSOS EMERGENCY',
      body: `Help is needed! View live map: https://statuesque-crisp-47480a.netlify.app/?id=${record.victim_id}`,
      priority: 'high',
    }

    const res = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    })

    const result = await res.json()
    return new Response(JSON.stringify(result), { 
      headers: { "Content-Type": "application/json" },
      status: 200 
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    })
  }
})