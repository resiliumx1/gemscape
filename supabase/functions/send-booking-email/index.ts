import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const OWNER_EMAIL = "info@gemscapetours.com";
const SENDER_EMAIL = "bookings@gemscapetours.com";
const SENDER_NAME = "Gemscape Travel & Tours";
const WHATSAPP_NUMBER = "12687831234";
const ADMIN_URL = "https://gemscapetours.com/admin";

/* ═══════════════════════════════════════════════
   SHARED TEMPLATE PIECES
   ═══════════════════════════════════════════════ */

const emailHeader = `
<div style="background-color:#0B2A3B;padding:32px 0;text-align:center;">
  <table role="presentation" style="margin:0 auto;"><tr><td>
    <h1 style="font-family:Georgia,serif;font-size:28px;color:#F5EFE0;margin:0;font-weight:400;letter-spacing:0.02em;">
      G E M S C A P E
    </h1>
    <p style="font-family:Arial,sans-serif;font-size:10px;color:rgba(255,255,255,0.45);margin:4px 0 0;letter-spacing:0.18em;text-transform:uppercase;">
      Travel &amp; Tours · Antigua
    </p>
  </td></tr></table>
</div>`;

const emailFooter = `
<div style="background-color:#0B2A3B;padding:32px 24px;text-align:center;">
  <p style="font-family:Arial,sans-serif;font-size:12px;color:rgba(255,255,255,0.50);margin:0;line-height:1.6;">
    Gemscape Travel and Tours · St. John's, Antigua, W.I.
  </p>
  <p style="font-family:Arial,sans-serif;font-size:11px;color:rgba(255,255,255,0.30);margin:8px 0 0;">
    © ${new Date().getFullYear()} Gemscape Travel & Tours. All rights reserved.
  </p>
</div>`;

const emailFooterWithUnsub = (email: string) => `
<div style="background-color:#0B2A3B;padding:32px 24px;text-align:center;">
  <p style="font-family:Arial,sans-serif;font-size:12px;color:rgba(255,255,255,0.50);margin:0;line-height:1.6;">
    Gemscape Travel and Tours · St. John's, Antigua, W.I.
  </p>
  <p style="font-family:Arial,sans-serif;font-size:11px;color:rgba(255,255,255,0.30);margin:12px 0 0;">
    You are receiving this because you recently booked an experience with Gemscape Travel and Tours.<br/>
    <a href="mailto:${OWNER_EMAIL}?subject=Unsubscribe%20${encodeURIComponent(email)}" style="color:rgba(255,255,255,0.40);text-decoration:underline;">Unsubscribe</a>
  </p>
</div>`;

const wrap = (content: string) => `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background-color:#F5EFE0;">
<table role="presentation" style="width:100%;background-color:#F5EFE0;"><tr><td align="center" style="padding:0;">
<table role="presentation" style="width:100%;max-width:600px;margin:0 auto;background-color:#F5EFE0;">
<tr><td>${content}</td></tr>
</table>
</td></tr></table>
</body></html>`;

const button = (text: string, href: string, bgColor = "#D4523A") => `
<table role="presentation" style="margin:24px 0;"><tr><td>
<a href="${href}" target="_blank" style="display:inline-block;background-color:${bgColor};color:#ffffff;font-family:Arial,sans-serif;font-weight:600;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;padding:14px 32px;text-decoration:none;mso-padding-alt:0;text-align:center;">
  ${text}
</a>
</td></tr></table>`;

const summaryRow = (label: string, value: string) => `
<tr>
  <td style="padding:10px 0;border-bottom:1px solid #EAD9BB;font-family:Arial,sans-serif;font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#B8965A;width:140px;vertical-align:top;">${label}</td>
  <td style="padding:10px 0 10px 16px;border-bottom:1px solid #EAD9BB;font-family:Arial,sans-serif;font-size:14px;color:#0B2A3B;font-weight:300;">${value}</td>
</tr>`;

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr + "T12:00:00Z");
    return d.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  } catch { return dateStr; }
}

function firstName(fullName: string): string {
  return (fullName || "").split(" ")[0] || "Guest";
}

/* ═══════════════════════════════════════════════
   EMAIL 1: CUSTOMER BOOKING CONFIRMATION (tours)
   ═══════════════════════════════════════════════ */

function buildTourCustomerConfirmation(b: Record<string, any>): { subject: string; html: string } {
  const addOns = Array.isArray(b.add_ons) && b.add_ons.length > 0 ? b.add_ons.join(", ") : "None";
  const html = wrap(`
    ${emailHeader}
    <div style="padding:40px 32px;">
      <h1 style="font-family:Georgia,serif;font-size:36px;color:#0B2A3B;margin:0 0 20px;font-weight:400;line-height:1.1;">
        Your Journey Awaits.
      </h1>
      <p style="font-family:Arial,sans-serif;font-size:16px;color:#0B2A3B;font-weight:300;line-height:1.7;margin:0 0 8px;">
        Dear ${b.full_name || "Valued Guest"},
      </p>
      <p style="font-family:Arial,sans-serif;font-size:16px;color:#0B2A3B;font-weight:300;line-height:1.7;margin:0 0 24px;">
        Thank you for choosing Gemscape. Your experience has been received and our team is reviewing your request. You'll hear from us within 24 hours to confirm details and finalize your itinerary.
      </p>

      <!-- Booking Summary Box -->
      <div style="background-color:#ffffff;border:1px solid #EAD9BB;padding:28px;margin:0 0 32px;">
        <h2 style="font-family:Georgia,serif;font-style:italic;font-size:20px;color:#B8965A;margin:0 0 16px;font-weight:400;">
          Booking Summary
        </h2>
        <table role="presentation" style="width:100%;border-collapse:collapse;">
          ${summaryRow("Reference", b.booking_ref || "—")}
          ${summaryRow("Service", b.service_type || "—")}
          ${summaryRow("Date", formatDate(b.tour_date))}
          ${summaryRow("Party", `${b.adults || 0} adults, ${b.children || 0} children`)}
          ${summaryRow("Pickup", b.pickup_location || "—")}
          ${addOns !== "None" ? summaryRow("Add-Ons", addOns) : ""}
          ${summaryRow("Special Requests", b.special_requests || "None")}
        </table>
      </div>

      <!-- What Happens Next -->
      <h2 style="font-family:Georgia,serif;font-size:22px;color:#0B2A3B;margin:0 0 16px;font-weight:400;">
        What Happens Next?
      </h2>
      <table role="presentation" style="width:100%;margin:0 0 24px;">
        <tr>
          <td style="padding:8px 12px 8px 0;vertical-align:top;font-family:Georgia,serif;font-size:20px;color:#B8965A;font-weight:600;width:28px;">1.</td>
          <td style="padding:8px 0;font-family:Arial,sans-serif;font-size:15px;color:#0B2A3B;font-weight:300;line-height:1.6;">Our team reviews your booking and confirms availability (within 24 hours)</td>
        </tr>
        <tr>
          <td style="padding:8px 12px 8px 0;vertical-align:top;font-family:Georgia,serif;font-size:20px;color:#B8965A;font-weight:600;">2.</td>
          <td style="padding:8px 0;font-family:Arial,sans-serif;font-size:15px;color:#0B2A3B;font-weight:300;line-height:1.6;">We'll send your final itinerary and meeting point details</td>
        </tr>
        <tr>
          <td style="padding:8px 12px 8px 0;vertical-align:top;font-family:Georgia,serif;font-size:20px;color:#B8965A;font-weight:600;">3.</td>
          <td style="padding:8px 0;font-family:Arial,sans-serif;font-size:15px;color:#0B2A3B;font-weight:300;line-height:1.6;">On your tour day, your guide will meet you at the specified location</td>
        </tr>
      </table>

      <p style="font-family:Arial,sans-serif;font-size:16px;color:#0B2A3B;font-weight:300;margin:0 0 4px;">
        Need to reach us sooner?
      </p>
      ${button("Message Us on WhatsApp", `https://wa.me/${WHATSAPP_NUMBER}`)}
    </div>
    ${emailFooter}
  `);

  return {
    subject: `Your Gemscape experience is confirmed ✦ ${b.booking_ref || ""}`,
    html,
  };
}

/* ═══════════════════════════════════════════════
   EMAIL 2: OWNER NOTIFICATION (new tour booking)
   ═══════════════════════════════════════════════ */

function buildTourOwnerNotification(b: Record<string, any>): { subject: string; html: string } {
  const html = wrap(`
    ${emailHeader}
    <div style="padding:32px;">
      <h1 style="font-family:Georgia,serif;font-size:28px;color:#0B2A3B;margin:0 0 24px;font-weight:400;">
        New Booking Received
      </h1>
      <div style="background-color:#ffffff;border:1px solid #EAD9BB;padding:24px;">
        <table role="presentation" style="width:100%;border-collapse:collapse;">
          ${summaryRow("Reference", b.booking_ref || "—")}
          ${summaryRow("Name", b.full_name || "—")}
          ${summaryRow("Email", b.email || "—")}
          ${summaryRow("Phone", b.phone || "—")}
          ${summaryRow("Country", b.country || "—")}
          ${summaryRow("Service", b.service_type || "—")}
          ${summaryRow("Date", formatDate(b.tour_date))}
          ${summaryRow("Adults", String(b.adults || 0))}
          ${summaryRow("Children", String(b.children || 0))}
          ${summaryRow("Pickup", b.pickup_location || "—")}
          ${summaryRow("Flight", b.flight_details || "—")}
          ${summaryRow("Add-Ons", Array.isArray(b.add_ons) ? b.add_ons.join(", ") : "None")}
          ${summaryRow("Special Requests", b.special_requests || "None")}
          ${summaryRow("Estimate", `$${b.total_estimate || 0}`)}
          ${summaryRow("Created", new Date(b.created_at).toLocaleString())}
        </table>
      </div>
      ${button("View in Admin Dashboard", ADMIN_URL)}
    </div>
    ${emailFooter}
  `);

  return {
    subject: `🚨 New Booking: ${b.service_type || "Tour"} — ${b.full_name || "Guest"} — ${b.tour_date || ""}`,
    html,
  };
}

/* ═══════════════════════════════════════════════
   EMAIL 3: CUSTOMER RENTAL CONFIRMATION
   ═══════════════════════════════════════════════ */

function buildRentalCustomerConfirmation(b: Record<string, any>): { subject: string; html: string } {
  const addOns = Array.isArray(b.add_ons) && b.add_ons.length > 0 ? b.add_ons.join(", ") : "None";
  const vehicleName = b.vehicle_name || "Your Vehicle";
  const html = wrap(`
    ${emailHeader}
    <div style="padding:40px 32px;">
      <h1 style="font-family:Georgia,serif;font-size:36px;color:#0B2A3B;margin:0 0 20px;font-weight:400;line-height:1.1;">
        Your Rental Awaits.
      </h1>
      <p style="font-family:Arial,sans-serif;font-size:16px;color:#0B2A3B;font-weight:300;line-height:1.7;margin:0 0 8px;">
        Dear ${b.full_name || "Valued Guest"},
      </p>
      <p style="font-family:Arial,sans-serif;font-size:16px;color:#0B2A3B;font-weight:300;line-height:1.7;margin:0 0 24px;">
        Thank you for choosing Gemscape for your vehicle rental. Your request has been received and we're checking availability now.
      </p>

      <div style="background-color:#ffffff;border:1px solid #EAD9BB;padding:28px;margin:0 0 32px;">
        <h2 style="font-family:Georgia,serif;font-style:italic;font-size:20px;color:#B8965A;margin:0 0 16px;font-weight:400;">
          Rental Summary
        </h2>
        <table role="presentation" style="width:100%;border-collapse:collapse;">
          ${summaryRow("Reference", b.booking_ref || "—")}
          ${summaryRow("Vehicle", vehicleName)}
          ${summaryRow("Pickup Date", formatDate(b.pickup_date))}
          ${summaryRow("Return Date", formatDate(b.return_date))}
          ${summaryRow("Duration", `${b.total_days || 0} days`)}
          ${summaryRow("Pickup", b.pickup_location || "—")}
          ${summaryRow("Dropoff", b.dropoff_location || "—")}
          ${addOns !== "None" ? summaryRow("Add-Ons", addOns) : ""}
          ${summaryRow("Estimated Total", `$${b.total_estimate || 0}`)}
        </table>
      </div>

      <h2 style="font-family:Georgia,serif;font-size:22px;color:#0B2A3B;margin:0 0 16px;font-weight:400;">
        Preparing for Your Rental
      </h2>
      <table role="presentation" style="width:100%;margin:0 0 16px;">
        <tr>
          <td style="padding:8px 12px 8px 0;vertical-align:top;font-family:Georgia,serif;font-size:20px;color:#B8965A;font-weight:600;width:28px;">1.</td>
          <td style="padding:8px 0;font-family:Arial,sans-serif;font-size:15px;color:#0B2A3B;font-weight:300;line-height:1.6;">We'll confirm vehicle availability and send your rental agreement</td>
        </tr>
        <tr>
          <td style="padding:8px 12px 8px 0;vertical-align:top;font-family:Georgia,serif;font-size:20px;color:#B8965A;font-weight:600;">2.</td>
          <td style="padding:8px 0;font-family:Arial,sans-serif;font-size:15px;color:#0B2A3B;font-weight:300;line-height:1.6;">On pickup day, our team meets you at ${b.pickup_location || "the pickup location"} with the vehicle</td>
        </tr>
        <tr>
          <td style="padding:8px 12px 8px 0;vertical-align:top;font-family:Georgia,serif;font-size:20px;color:#B8965A;font-weight:600;">3.</td>
          <td style="padding:8px 0;font-family:Arial,sans-serif;font-size:15px;color:#0B2A3B;font-weight:300;line-height:1.6;">Return the vehicle to ${b.dropoff_location || "the return location"} by ${formatDate(b.return_date)} at the agreed time</td>
        </tr>
      </table>

      <div style="background-color:rgba(201,148,58,0.08);padding:16px 20px;margin:0 0 24px;">
        <p style="font-family:Arial,sans-serif;font-size:14px;color:#0B2A3B;font-weight:400;margin:0;line-height:1.5;">
          📋 Your driver's license and a credit card will be required at pickup.
        </p>
      </div>

      ${button("Message Us on WhatsApp", `https://wa.me/${WHATSAPP_NUMBER}`)}
    </div>
    ${emailFooter}
  `);

  return {
    subject: `Your Gemscape rental is confirmed ✦ ${b.booking_ref || ""}`,
    html,
  };
}

/* ═══════════════════════════════════════════════
   EMAIL 4: OWNER RENTAL NOTIFICATION
   ═══════════════════════════════════════════════ */

function buildRentalOwnerNotification(b: Record<string, any>): { subject: string; html: string } {
  const vehicleName = b.vehicle_name || "Vehicle";
  const html = wrap(`
    ${emailHeader}
    <div style="padding:32px;">
      <h1 style="font-family:Georgia,serif;font-size:28px;color:#0B2A3B;margin:0 0 24px;font-weight:400;">
        New Rental Booking
      </h1>
      <div style="background-color:#ffffff;border:1px solid #EAD9BB;padding:24px;">
        <table role="presentation" style="width:100%;border-collapse:collapse;">
          ${summaryRow("Reference", b.booking_ref || "—")}
          ${summaryRow("Name", b.full_name || "—")}
          ${summaryRow("Email", b.email || "—")}
          ${summaryRow("Phone", b.phone || "—")}
          ${summaryRow("Country", b.country || "—")}
          ${summaryRow("Vehicle", vehicleName)}
          ${summaryRow("Pickup", `${formatDate(b.pickup_date)} @ ${b.pickup_location}`)}
          ${summaryRow("Return", `${formatDate(b.return_date)} @ ${b.dropoff_location}`)}
          ${summaryRow("Duration", `${b.total_days || 0} days`)}
          ${summaryRow("Daily Rate", `$${b.daily_rate || 0}`)}
          ${summaryRow("Add-Ons", Array.isArray(b.add_ons) ? b.add_ons.join(", ") : "None")}
          ${summaryRow("Estimated Total", `$${b.total_estimate || 0}`)}
          ${summaryRow("License", `${b.driver_license || "—"} (${b.license_country || "—"})`)}
          ${summaryRow("Special Requests", b.special_requests || "None")}
        </table>
      </div>
      ${button("View in Admin Dashboard", ADMIN_URL)}
    </div>
    ${emailFooter}
  `);

  return {
    subject: `🚗 New Rental: ${vehicleName} — ${b.full_name || "Guest"} — ${b.pickup_date} to ${b.return_date}`,
    html,
  };
}

/* ═══════════════════════════════════════════════
   EMAIL 5: POST-TOUR REVIEW REQUEST
   ═══════════════════════════════════════════════ */

function buildReviewRequest(b: Record<string, any>, platforms: Record<string, { enabled: boolean; url: string }>): { subject: string; html: string } {
  const name = b.full_name || b.customer_name || "Valued Guest";
  const fName = firstName(name);
  const service = b.service_type || "experience";
  const ref = b.booking_ref || "";

  const platformButtons: string[] = [];
  if (platforms?.google?.enabled && platforms.google.url) {
    platformButtons.push(button("Leave a Google Review", platforms.google.url, "#0B2A3B"));
  }
  if (platforms?.tripadvisor?.enabled && platforms.tripadvisor.url) {
    platformButtons.push(button("Review Us on TripAdvisor", platforms.tripadvisor.url, "#0B2A3B"));
  }
  if (platforms?.facebook?.enabled && platforms.facebook.url) {
    platformButtons.push(button("Leave a Facebook Review", platforms.facebook.url, "#0B2A3B"));
  }
  if (platformButtons.length === 0) {
    platformButtons.push(button("Share Your Experience", `mailto:${OWNER_EMAIL}?subject=My%20Gemscape%20Experience`, "#0B2A3B"));
  }

  const email = b.email || b.customer_email || "";

  const html = wrap(`
    ${emailHeader}
    
    <!-- Hero image -->
    <div style="overflow:hidden;">
      <img src="https://images.unsplash.com/photo-1559494007-9f5847c49d94?w=600&q=85"
           alt="Antigua coastline" style="width:100%;height:auto;display:block;"/>
    </div>

    <div style="padding:40px 32px;">
      <h1 style="font-family:Georgia,serif;font-style:italic;font-size:28px;color:#0B2A3B;margin:0 0 20px;font-weight:400;line-height:1.3;">
        We hope Antigua was everything you dreamed of.
      </h1>
      
      <p style="font-family:Arial,sans-serif;font-size:16px;color:#0B2A3B;font-weight:300;line-height:1.8;margin:0 0 8px;">
        Dear ${fName},
      </p>
      <p style="font-family:Arial,sans-serif;font-size:16px;color:#0B2A3B;font-weight:300;line-height:1.8;margin:0 0 24px;">
        It was a genuine pleasure having you explore Antigua with us. We hope your ${service} left you with memories that stay with you long after you've returned home.
      </p>
      <p style="font-family:Arial,sans-serif;font-size:16px;color:#0B2A3B;font-weight:300;line-height:1.8;margin:0 0 32px;">
        If you have a moment, we'd be so grateful if you'd share your experience. Your words help other travellers discover Antigua — and they mean the world to our small team.
      </p>

      <!-- Review Platform Buttons -->
      <div style="text-align:center;">
        ${platformButtons.join("\n")}
      </div>

      <!-- Direct Feedback -->
      <div style="margin:32px 0 0;padding:20px 0 0;border-top:1px solid #EAD9BB;">
        <p style="font-family:Arial,sans-serif;font-size:15px;color:#0B2A3B;font-weight:300;line-height:1.7;margin:0 0 4px;">
          Not everything went as planned?
          <a href="mailto:${OWNER_EMAIL}?subject=Feedback%3A%20${encodeURIComponent(ref)}" style="color:#C9943A;text-decoration:underline;">Please tell us.</a>
        </p>
        <p style="font-family:Arial,sans-serif;font-size:15px;color:#0B2A3B;font-weight:300;line-height:1.7;margin:0;">
          We're always working to make every experience exceptional.
        </p>
      </div>

      <!-- Sign-off -->
      <div style="margin:32px 0 0;">
        <p style="font-family:Georgia,serif;font-style:italic;font-size:18px;color:#C9943A;margin:0;line-height:1.4;">
          With warmth,<br/>
          The Gemscape Team
        </p>
      </div>
    </div>
    ${emailFooterWithUnsub(email)}
  `);

  return {
    subject: `How was your Antigua adventure, ${fName}? ✦`,
    html,
  };
}

/* ═══════════════════════════════════════════════
   MAIN HANDLER
   ═══════════════════════════════════════════════ */

interface EmailPayload {
  booking: Record<string, any>;
  emailType:
    | "tour_customer_confirmation"
    | "tour_owner_notification"
    | "rental_customer_confirmation"
    | "rental_owner_notification"
    | "review_request"
    // Legacy types
    | "customer_confirmation"
    | "owner_notification";
  platforms?: Record<string, { enabled: boolean; url: string }>;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { booking, emailType, platforms } = (await req.json()) as EmailPayload;

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
      case "tour_customer_confirmation":
      case "customer_confirmation": {
        const result = buildTourCustomerConfirmation(booking);
        to = booking.email as string;
        subject = result.subject;
        html = result.html;
        break;
      }
      case "tour_owner_notification":
      case "owner_notification": {
        const result = buildTourOwnerNotification(booking);
        to = OWNER_EMAIL;
        subject = result.subject;
        html = result.html;
        break;
      }
      case "rental_customer_confirmation": {
        const result = buildRentalCustomerConfirmation(booking);
        to = booking.email as string;
        subject = result.subject;
        html = result.html;
        break;
      }
      case "rental_owner_notification": {
        const result = buildRentalOwnerNotification(booking);
        to = OWNER_EMAIL;
        subject = result.subject;
        html = result.html;
        break;
      }
      case "review_request": {
        const result = buildReviewRequest(booking, platforms || {});
        to = (booking.email || booking.customer_email) as string;
        subject = result.subject;
        html = result.html;
        break;
      }
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
