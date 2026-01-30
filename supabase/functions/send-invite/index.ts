import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "resend";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface InviteRequest {
  participantName: string;
  participantEmail: string;
  diagnosticUrl: string;
  facilitatorId?: string;
  facilitatorName?: string;
}

interface FacilitatorProfile {
  full_name: string | null;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
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

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { participantName, participantEmail, diagnosticUrl, facilitatorId, facilitatorName }: InviteRequest = 
      await req.json();

    // Validate required fields
    if (!participantName || !participantEmail || !diagnosticUrl) {
      return new Response(
        JSON.stringify({ error: "Campos obrigatórios ausentes: participantName, participantEmail, diagnosticUrl" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Default branding values
    let primaryColor = "#8b5cf6";
    let secondaryColor = "#7c3aed";
    let logoUrl: string | null = null;
    let displayFacilitatorName = facilitatorName || null;

    // Fetch facilitator profile if facilitatorId is provided
    if (facilitatorId) {
      try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

        if (supabaseUrl && supabaseServiceKey) {
          const supabase = createClient(supabaseUrl, supabaseServiceKey);

          const { data: profileData } = await supabase
            .from("profiles")
            .select("full_name, logo_url, primary_color, secondary_color")
            .eq("user_id", facilitatorId)
            .single();

          if (profileData) {
            primaryColor = profileData.primary_color || primaryColor;
            secondaryColor = profileData.secondary_color || darkenColor(primaryColor);
            logoUrl = profileData.logo_url;
            displayFacilitatorName = profileData.full_name || displayFacilitatorName;
          }
        }
      } catch (fetchError) {
        console.warn("Could not fetch facilitator profile:", fetchError);
        // Continue with default branding
      }
    }

    const darkenedPrimary = darkenColor(primaryColor);

    // Professional HTML email template with dynamic branding
    const htmlTemplate = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Convite para Diagnóstico IQ+IS</title>
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
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                Diagnóstico IQ+IS
              </h1>
              <p style="margin: 8px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">
                Inteligência Integral
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
                Você foi convidado(a) para realizar o <strong>Diagnóstico de Inteligência Integral (IQ+IS)</strong>.
              </p>

              <p style="margin: 0 0 16px; color: #4b5563; font-size: 16px; line-height: 1.7;">
                Este diagnóstico avaliará <strong>5 dimensões</strong> do seu desenvolvimento:
              </p>

              <ul style="margin: 0 0 24px; padding-left: 24px; color: #4b5563; font-size: 15px; line-height: 2;">
                <li>🧘 <strong>Consciência Interior</strong></li>
                <li>💚 <strong>Coerência Emocional</strong></li>
                <li>🎯 <strong>Conexão e Propósito</strong></li>
                <li>🤝 <strong>Relações e Compaixão</strong></li>
                <li>🌱 <strong>Transformação</strong></li>
              </ul>

              <p style="margin: 0 0 32px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                ⏱️ O diagnóstico leva aproximadamente <strong>15-20 minutos</strong> para ser concluído.
              </p>

              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center">
                    <a href="${diagnosticUrl}" 
                       style="display: inline-block; padding: 16px 48px; background: linear-gradient(135deg, ${primaryColor} 0%, ${darkenedPrimary} 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px; box-shadow: 0 4px 14px rgba(139, 92, 246, 0.4);">
                      Iniciar Diagnóstico →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 32px 0 0; padding: 16px; background-color: #fef3c7; border-radius: 8px; color: #92400e; font-size: 13px; text-align: center;">
                ⚠️ Este link é <strong>pessoal e intransferível</strong>. Não compartilhe com outras pessoas.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f9fafb; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Este email foi enviado automaticamente pelo sistema de Diagnóstico IQ+IS.
                ${displayFacilitatorName ? `<br>Facilitador: <strong>${displayFacilitatorName}</strong>` : ''}
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

    console.log(`Sending invite email to ${participantEmail} with branding from facilitator ${facilitatorId || 'default'}`);

    const emailResponse = await resend.emails.send({
      from: "Diagnóstico IQ+IS <onboarding@resend.dev>",
      to: [participantEmail],
      subject: "Você foi convidado para o Diagnóstico IQ+IS",
      html: htmlTemplate,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-invite function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
