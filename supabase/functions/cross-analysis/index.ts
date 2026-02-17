/**
 * Cross-Analysis Edge Function
 *
 * Securely calls the OpenAI API on the server side to generate
 * personalized cross-analysis insights from multiple test results.
 *
 * Environment variables required:
 *   OPENAI_API_KEY - OpenAI API key (set in Supabase Dashboard → Edge Functions → Secrets)
 *
 * Request body:
 *   { systemPrompt: string, userPrompt: string }
 *
 * Response:
 *   { analysis: string }
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CrossAnalysisRequest {
  systemPrompt: string;
  userPrompt: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate request method
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Método não permitido" }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const body: CrossAnalysisRequest = await req.json();
    const { systemPrompt, userPrompt } = body;

    // Validate required fields
    if (!systemPrompt || !userPrompt) {
      return new Response(
        JSON.stringify({ error: "Campos obrigatórios: systemPrompt, userPrompt" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate prompt sizes to prevent abuse
    if (systemPrompt.length > 2000 || userPrompt.length > 15000) {
      return new Response(
        JSON.stringify({ error: "Prompt excede o tamanho máximo permitido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get OpenAI API key from environment (secure, never exposed to client)
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      console.error("OPENAI_API_KEY not configured in Edge Function secrets");
      return new Response(
        JSON.stringify({ error: "Serviço de IA não configurado. Configure OPENAI_API_KEY nos secrets da Edge Function." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call OpenAI API
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error(`OpenAI API error (${openaiResponse.status}):`, errorText);
      return new Response(
        JSON.stringify({ error: "Erro na API de IA", status: openaiResponse.status }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const openaiResult = await openaiResponse.json();
    const analysis = openaiResult.choices?.[0]?.message?.content || "";

    if (!analysis) {
      return new Response(
        JSON.stringify({ error: "A IA não retornou uma análise válida" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ analysis }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error in cross-analysis function:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
