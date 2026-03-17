import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const OWNER_EMAIL = "info@gemscapetours.com";
const SENDER_EMAIL = "bookings@gemscapetours.com";
const SENDER_NAME = "Gemscape Travel & Tours";

interface BookingPayload {
  booking: Record<string, unknown>;
  emailType: "customer_confirmation" | "owner_notification" | "review_request";
}

function buildCustomerConfirmation(booking: Record<string, unknown>): string {
  const name = booking.full_name || "Valued Guest";
  const ref = booking.booking_ref || "";
  const date = booking.tour_date || booking.pickup_date || "";
  const service = booking.service_type || "your booking";
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#f5f0e8;">
      <h1 style="color:#0d2d3e;font-size:24px;">Booking Confirmed ✓</h1>
      <p>Hello ${name},</p>
      <p>Thank you for booking with Gemscape Travel & Tours!</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr><td style="padding:8px;font-weight:bold;">Reference</td><td style="padding:8px;">${ref}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;">Service</td><td style="padding:8px;">${service}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;">Date</td><td style="padding:8px;">${date}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;">Party Size</td><td style="padding:8px;">${booking.party_size || booking.total_days || "—"}</td></tr>
      </table>
      <p>We'll be in touch shortly to confirm the details. If you have questions, reply to this email or WhatsApp us.</p>
      <p style="color:#0d2d3e;font-weight:600;">— The Gemscape Team</p>
    </div>`;
}

function buildOwnerNotification(booking: Record<string, unknown>): string {
  const ref = booking.booking_ref || "N/A";
  const name = booking.full_name || "Unknown";
  const email = booking.email || "";
  const phone = booking.phone || "";
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;">
      <h1 style="color:#0d2d3e;">New Booking: ${ref}</h1>
      <p><strong>Customer:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Service:</strong> ${booking.service_type || "rental"}</p>
      <p><strong>Date:</strong> ${booking.tour_date || booking.pickup_date || "—"}</p>
      <pre style="background:#f0f0f0;padding:16px;font-size:12px;overflow:auto;">${JSON.stringify(booking, null, 2)}</pre>
    </div>`;
}

function buildReviewRequest(booking: Record<string, unknown>): string {
  const name = booking.full_name || booking.customer_name || "Valued Guest";
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#f5f0e8;text-align:center;">
      <h1 style="color:#0d2d3e;">How was your experience?</h1>
      <p>Hi ${name}, we hope you had an incredible time with Gemscape Travel & Tours!</p>
      <p>Your feedback helps other travellers discover Mauritius. Would you take a moment to share your experience?</p>
      <a href="https://g.page/r/gemscapetours/review" style="display:inline-block;background:#0d2d3e;color:#f5f0e8;padding:14px 28px;text-decoration:none;font-weight:600;margin:16px 0;">Leave a Review ★</a>
      <p style="font-size:13px;color:#666;">Thank you for choosing Gemscape!</p>
    </div>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { booking, emailType } = (await req.json()) as BookingPayload;

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.warn("RESEND_API_KEY not set — email not sent (stub mode)");
      return new Response(
        JSON.stringify({ success: true, stub: true, message: "No API key — email skipped" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let subject = "";
    let html = "";
    let to = "";

    switch (emailType) {
      case "customer_confirmation":
        to = booking.email as string;
        subject = `Booking Confirmed — ${booking.booking_ref || "Gemscape"}`;
        html = buildCustomerConfirmation(booking);
        break;
      case "owner_notification":
        to = OWNER_EMAIL;
        subject = `New Booking: ${booking.booking_ref || "Unknown"} — ${booking.full_name}`;
        html = buildOwnerNotification(booking);
        break;
      case "review_request":
        to = (booking.email || booking.customer_email) as string;
        subject = "How was your Gemscape experience? ★";
        html = buildReviewRequest(booking);
        break;
      default:
        throw new Error(`Unknown email type: ${emailType}`);
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
        to: [to],
        reply_to: OWNER_EMAIL,
        subject,
        html,
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      console.error("Resend error:", result);
      return new Response(JSON.stringify({ success: false, error: result }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, id: result.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-booking-email error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
