import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmergencyAlertRequest {
  userId: string | null;
  userName: string;
  latitude: number;
  longitude: number;
  alertId: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Emergency alert function called");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, userName, latitude, longitude, alertId }: EmergencyAlertRequest = await req.json();
    
    console.log("Request data:", { userId, userName, latitude, longitude, alertId });

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch emergency contacts for the user
    let contacts: { name: string; email: string | null; phone: string | null }[] = [];
    
    if (userId) {
      const { data: emergencyContacts, error: contactsError } = await supabase
        .from("emergency_contacts")
        .select("name, email, phone")
        .eq("user_id", userId);

      if (contactsError) {
        console.error("Error fetching contacts:", contactsError);
      } else {
        contacts = emergencyContacts || [];
      }
    }

    console.log("Found emergency contacts:", contacts.length);

    // Generate Google Maps link
    const mapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
    const timestamp = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
      dateStyle: "full",
      timeStyle: "long",
    });

    // Email content
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">🚨 EMERGENCY ALERT</h1>
          <p style="margin: 5px 0 0 0; font-size: 16px;">SafeRoute Women Safety System</p>
        </div>
        
        <div style="background: #fef2f2; padding: 25px; border: 1px solid #fecaca;">
          <p style="font-size: 18px; color: #dc2626; margin: 0 0 20px 0;">
            <strong>${userName || "A SafeRoute user"}</strong> has triggered an emergency alert.
          </p>
          
          <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #ef4444;">
            <p style="margin: 0 0 10px 0; color: #374151;">
              <strong>📍 Live Location:</strong><br>
              <a href="${mapsLink}" style="color: #2563eb; word-break: break-all;">${mapsLink}</a>
            </p>
            <p style="margin: 0 0 10px 0; color: #374151;">
              <strong>🌐 Coordinates:</strong> ${latitude.toFixed(6)}, ${longitude.toFixed(6)}
            </p>
            <p style="margin: 0; color: #374151;">
              <strong>⏰ Time:</strong> ${timestamp}
            </p>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background: #fee2e2; border-radius: 8px;">
            <p style="margin: 0; color: #991b1b; font-weight: bold; text-align: center;">
              ⚠️ PLEASE RESPOND IMMEDIATELY ⚠️
            </p>
          </div>
        </div>
        
        <div style="background: #374151; color: white; padding: 15px; border-radius: 0 0 10px 10px; text-align: center;">
          <p style="margin: 0; font-size: 12px;">
            This is an automated emergency alert from SafeRoute.<br>
            Alert ID: ${alertId}
          </p>
        </div>
      </div>
    `;

    const results: { email: string; success: boolean; error?: string }[] = [];

    // Send email to each contact with an email address
    for (const contact of contacts) {
      if (contact.email) {
        try {
          console.log(`Sending email to ${contact.name} at ${contact.email}`);
          
          const emailResponse = await resend.emails.send({
            from: "SafeRoute Emergency <onboarding@resend.dev>",
            to: [contact.email],
            subject: `🚨 EMERGENCY ALERT - ${userName || "SafeRoute User"} needs help!`,
            html: emailHtml,
          });

          console.log("Email sent successfully:", emailResponse);
          results.push({ email: contact.email, success: true });
        } catch (emailError: any) {
          console.error(`Failed to send email to ${contact.email}:`, emailError);
          results.push({ email: contact.email, success: false, error: emailError.message });
        }
      }
    }

    // Update the panic alert with delivery status
    const successCount = results.filter(r => r.success).length;
    const deliveryStatus = successCount > 0 ? "delivered" : (contacts.length === 0 ? "no_contacts" : "failed");

    console.log(`Delivery status: ${deliveryStatus}, sent to ${successCount}/${contacts.length} contacts`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Emergency alert sent to ${successCount} contact(s)`,
        deliveryStatus,
        results,
        mapsLink,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-emergency-alert function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        deliveryStatus: "error" 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
