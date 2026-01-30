import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface InviteManagerRequest {
  managerName: string;
  managerEmail: string;
  companyName: string;
  inviteUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { managerName, managerEmail, companyName, inviteUrl }: InviteManagerRequest = 
      await req.json();

    // Validate required fields
    if (!managerName || !managerEmail || !companyName || !inviteUrl) {
      throw new Error("Missing required fields");
    }

    const emailResponse = await resend.emails.send({
      from: "IQ-IS <noreply@iqis.com.br>",
      to: [managerEmail],
      subject: `Convite para acessar o Portal da ${companyName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
          <div style="background-color: #fff; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #C4A484; margin: 0; font-size: 28px;">Portal da Empresa</h1>
              <p style="color: #666; margin: 10px 0 0 0;">IQ-IS - Diagnóstico de Inteligência Emocional</p>
            </div>
            
            <h2 style="color: #333; font-size: 20px; margin-bottom: 20px;">
              Olá, ${managerName}!
            </h2>
            
            <p style="color: #555; margin-bottom: 20px;">
              Você foi convidado(a) para acessar o <strong>Portal da Empresa</strong> e acompanhar os resultados agregados dos diagnósticos de inteligência emocional da equipe da <strong>${companyName}</strong>.
            </p>

            <div style="background-color: #f8f4ef; border-radius: 8px; padding: 20px; margin: 25px 0;">
              <h3 style="color: #C4A484; margin: 0 0 10px 0; font-size: 16px;">O que você poderá visualizar:</h3>
              <ul style="color: #555; margin: 0; padding-left: 20px;">
                <li>Progresso geral de participação da equipe</li>
                <li>Médias agregadas por dimensão do diagnóstico</li>
                <li>Pontos fortes e áreas de desenvolvimento coletivas</li>
                <li>Relatório consolidado da equipe em PDF</li>
              </ul>
            </div>

            <p style="color: #888; font-size: 14px; margin-bottom: 20px;">
              <strong>Nota:</strong> Você terá acesso apenas a dados agregados e anonimizados. Nenhum resultado individual será exibido.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${inviteUrl}" 
                 style="display: inline-block; background-color: #C4A484; color: #fff; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                Criar Minha Conta
              </a>
            </div>
            
            <p style="color: #888; font-size: 12px; text-align: center; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
              Se o botão não funcionar, copie e cole este link no seu navegador:<br>
              <a href="${inviteUrl}" style="color: #C4A484; word-break: break-all;">${inviteUrl}</a>
            </p>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Manager invite email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in invite-manager function:", error);
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
