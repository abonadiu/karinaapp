import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, calendly-webhook-signature",
};

async function verifySignature(
  body: string,
  signature: string | null,
  signingKey: string
): Promise<boolean> {
  if (!signature || !signingKey) return false;

  try {
    // Calendly signature format: t=timestamp,v1=signature
    const parts = signature.split(",");
    const timestampPart = parts.find((p) => p.startsWith("t="));
    const signaturePart = parts.find((p) => p.startsWith("v1="));

    if (!timestampPart || !signaturePart) return false;

    const timestamp = timestampPart.slice(2);
    const sig = signaturePart.slice(3);

    // Create signed payload
    const signedPayload = `${timestamp}.${body}`;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(signingKey),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const computed = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(signedPayload)
    );

    const computedHex = Array.from(new Uint8Array(computed))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return computedHex === sig;
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get Calendly integration settings
    const { data: settings, error: settingsError } = await supabase
      .from("system_settings")
      .select("value")
      .eq("key", "calendly_integration")
      .single();

    if (settingsError || !settings) {
      console.error("Failed to fetch settings:", settingsError);
      return new Response(JSON.stringify({ error: "Integration not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const integrationSettings = settings.value as {
      enabled: boolean;
      signing_key: string | null;
      last_sync: string | null;
      events_count: number;
    };

    if (!integrationSettings.enabled) {
      return new Response(JSON.stringify({ error: "Integration disabled" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get request body
    const body = await req.text();
    const signature = req.headers.get("Calendly-Webhook-Signature");

    // Verify signature if signing key is configured
    if (integrationSettings.signing_key) {
      const isValid = await verifySignature(body, signature, integrationSettings.signing_key);
      if (!isValid) {
        console.error("Invalid webhook signature");
        return new Response(JSON.stringify({ error: "Invalid signature" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Parse event payload
    const event = JSON.parse(body);
    console.log("Received Calendly event:", event.event);

    const payload = event.payload;

    if (event.event === "invitee.created") {
      // Find participant by email
      const { data: participant, error: participantError } = await supabase
        .from("participants")
        .select("id, facilitator_id, name")
        .eq("email", payload.email)
        .single();

      if (participantError || !participant) {
        console.log("Participant not found for email:", payload.email);
        // Still return 200 to acknowledge receipt
        return new Response(JSON.stringify({ 
          success: true, 
          message: "Participant not found, event acknowledged" 
        }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Create feedback session
      const { error: insertError } = await supabase
        .from("feedback_sessions")
        .insert({
          participant_id: participant.id,
          facilitator_id: participant.facilitator_id,
          status: "scheduled",
          scheduled_at: payload.scheduled_event?.start_time || null,
          event_name: payload.scheduled_event?.name || "Sessão de Feedback",
          calendly_event_uri: payload.scheduled_event?.uri || null,
          calendly_invitee_uri: payload.uri || null,
        });

      if (insertError) {
        console.error("Failed to create feedback session:", insertError);
        return new Response(JSON.stringify({ error: "Failed to create session" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Update events count and last sync
      await supabase
        .from("system_settings")
        .update({
          value: {
            ...integrationSettings,
            events_count: (integrationSettings.events_count || 0) + 1,
            last_sync: new Date().toISOString(),
          },
          updated_at: new Date().toISOString(),
        })
        .eq("key", "calendly_integration");

      console.log("Created feedback session for:", participant.name);
    }

    if (event.event === "invitee.canceled") {
      // Update session status to cancelled
      const { error: updateError } = await supabase
        .from("feedback_sessions")
        .update({ status: "cancelled", updated_at: new Date().toISOString() })
        .eq("calendly_invitee_uri", payload.uri);

      if (updateError) {
        console.error("Failed to cancel session:", updateError);
      } else {
        console.log("Cancelled session for invitee:", payload.uri);
      }

      // Update last sync
      await supabase
        .from("system_settings")
        .update({
          value: {
            ...integrationSettings,
            last_sync: new Date().toISOString(),
          },
          updated_at: new Date().toISOString(),
        })
        .eq("key", "calendly_integration");
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
