import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    const record = payload.record;
    const table = payload.table;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const bookingType = table === "rental_bookings" ? "rental" : "tour";
    const tourDate = record.tour_date || record.pickup_date;

    // Send customer confirmation
    await fetch(`${supabaseUrl}/functions/v1/send-booking-email`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        booking: record,
        emailType: "customer_confirmation",
      }),
    });

    // Send owner notification
    await fetch(`${supabaseUrl}/functions/v1/send-booking-email`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        booking: record,
        emailType: "owner_notification",
      }),
    });

    // Insert into review_queue — scheduled 24h after tour date
    const scheduledSend = new Date(tourDate);
    scheduledSend.setDate(scheduledSend.getDate() + 1);
    scheduledSend.setHours(10, 0, 0, 0);

    await supabase.from("review_queue").insert({
      booking_id: record.id,
      booking_type: bookingType,
      customer_email: record.email,
      customer_name: record.full_name,
      service_type: record.service_type || "rental",
      tour_date: tourDate,
      scheduled_send: scheduledSend.toISOString(),
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("booking-webhook error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
