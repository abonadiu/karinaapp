import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ManualReminderRequest {
  participantId: string;
  participantName: string;
  participantEmail: string;
  accessToken: string;
  daysSinceInvite?: number;
}

/**
 * Darkens a hex color by a percentage
 */
function darkenColor(hex: string, percent: number = 20): string {
  const cleanHex = hex.replace('#', '');
  const num = parseInt(cleanHex, 16);
  const r = Math.max(0, (num >> 16) - Math.round(255 * percent / 100));
  const g = Math.max(0, ((num >> 8) & 0x00FF) - Math.round(255 * percent / 100));
  const b = Math.max(0, (num & 0x0000FF) - Math.round(255 * percent / 100));
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
}

/**
 * Generates the reminder email HTML template
 */
function generateReminderEmailHtml(
  participantName: string,
  diagnosticUrl: string,
  daysSinceInvite: number,
  reminderNumber: number,
  primaryColor: string,
  logoUrl: string | null,
  facilitatorName: string | null
): string {
  const darkenedPrimary = darkenColor(primaryColor);
  
  const urgencyMessage = reminderNumber >= 3 
    ? "Este é um dos últimos lembretes que você receberá."
    : "";

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lembrete: Diagnóstico IQ+IS</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, ${primaryColor} 0%, ${darkenedPrimary} 100%); border-radius: 12px 12px 0 0;">
              ${logoUrl ? `<img src="${logoUrl}" alt="Logo" style="height: 50px; margin-bottom: 16px; display: block; margin-left: auto; margin-right: auto;" />` : ''}
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">
                ⏰ Lembrete
              </h1>
              <p style="margin: 8px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">
                Seu diagnóstico está aguardando
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #1f2937; font-size: 18px; line-height: 1.6;">
                Olá <strong>${participantName}</strong>!
              </p>
              
              <p style="margin: 0 0 24px; color: #4b5563; font-size: 16px; line-height: 1.7;">
                Notamos que você ainda não concluiu o <strong>Diagnóstico de Inteligência Integral (IQ+IS)</strong>. 
                ${daysSinceInvite > 0 ? `Seu convite foi enviado há <strong>${daysSinceInvite} dias</strong>.` : 'Complete seu diagnóstico agora!'}
              </p>

              <p style="margin: 0 0 16px; color: #4b5563; font-size: 16px; line-height: 1.7;">
                Reservar <strong>15-20 minutos</strong> para completar o diagnóstico pode trazer insights valiosos sobre:
              </p>

              <ul style="margin: 0 0 24px; padding-left: 24px; color: #4b5563; font-size: 15px; line-height: 2;">
                <li>🧘 Sua <strong>consciência interior</strong> e autoconhecimento</li>
                <li>💚 Seu equilíbrio <strong>emocional</strong></li>
                <li>🎯 Clareza de <strong>propósito</strong> e direção</li>
                <li>🤝 Qualidade das suas <strong>relações</strong></li>
                <li>🌱 Capacidade de <strong>transformação</strong></li>
              </ul>

              ${urgencyMessage ? `
              <p style="margin: 0 0 24px; padding: 12px 16px; background-color: #fef3c7; border-left: 4px solid #f59e0b; color: #92400e; font-size: 14px; border-radius: 4px;">
                ${urgencyMessage}
              </p>
              ` : ''}

              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center">
                    <a href="${diagnosticUrl}" 
                       style="display: inline-block; padding: 16px 48px; background: linear-gradient(135deg, ${primaryColor} 0%, ${darkenedPrimary} 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px; box-shadow: 0 4px 14px rgba(139, 92, 246, 0.4);">
                      Continuar Diagnóstico →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 32px 0 0; padding: 16px; background-color: #f3f4f6; border-radius: 8px; color: #6b7280; font-size: 13px; text-align: center;">
                Se você já concluiu o diagnóstico, pode ignorar este email com segurança.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f9fafb; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Este é um lembrete do sistema de Diagnóstico IQ+IS.
                ${facilitatorName ? `<br>Facilitador: <strong>${facilitatorName}</strong>` : ''}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    // Parse request body
    const { 
      participantId, 
      participantName, 
      participantEmail, 
      accessToken,
      daysSinceInvite = 0
    }: ManualReminderRequest = await req.json();

    if (!participantId || !participantName || !participantEmail || !accessToken) {
      throw new Error("Missing required fields: participantId, participantName, participantEmail, accessToken");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get participant's current reminder count and facilitator_id
    const { data: participant, error: participantError } = await supabase
      .from("participants")
      .select("reminder_count, facilitator_id")
      .eq("id", participantId)
      .single();

    if (participantError || !participant) {
      throw new Error("Participant not found");
    }

    // Fetch facilitator profile for branding
    let profile: { full_name: string | null; logo_url: string | null; primary_color: string | null } | null = null;
    
    if (participant.facilitator_id) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, logo_url, primary_color")
        .eq("user_id", participant.facilitator_id)
        .single();
      
      profile = profileData;
    }

    // Build diagnostic URL
    const baseUrl = Deno.env.get("SITE_URL") || "https://karinaapp.lovable.app";
    const diagnosticUrl = `${baseUrl}/diagnostico?token=${accessToken}`;

    // Determine branding
    const primaryColor = profile?.primary_color || "#8b5cf6";
    const logoUrl = profile?.logo_url || null;
    const facilitatorName = profile?.full_name || null;

    // Generate email HTML
    const htmlContent = generateReminderEmailHtml(
      participantName,
      diagnosticUrl,
      daysSinceInvite,
      participant.reminder_count + 1,
      primaryColor,
      logoUrl,
      facilitatorName
    );

    // Send email
    const emailResponse = await resend.emails.send({
      from: "Diagnóstico IQ+IS <onboarding@resend.dev>",
      to: [participantEmail],
      subject: `Lembrete: Complete seu Diagnóstico IQ+IS`,
      html: htmlContent,
    });

    console.log(`Manual reminder sent to ${participantEmail}:`, emailResponse);

    // Record the reminder in the database
    const { error: recordError } = await supabase
      .rpc('record_reminder_sent', {
        p_participant_id: participantId,
        p_success: true,
        p_error_message: null
      });

    if (recordError) {
      console.error(`Failed to record reminder for ${participantId}:`, recordError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Lembrete enviado para ${participantEmail}`,
        emailResponse
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in send-reminder function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
