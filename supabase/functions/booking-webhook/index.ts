import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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

    const isRental = table === "rental_bookings";
    const tourDate = record.tour_date || record.pickup_date;

    // For rental bookings, fetch vehicle name
    let enrichedRecord = { ...record };
    if (isRental && record.vehicle_id) {
      const { data: vehicle } = await supabase
        .from("vehicles")
        .select("name")
        .eq("id", record.vehicle_id)
        .single();
      if (vehicle) enrichedRecord.vehicle_name = vehicle.name;
    }

    // Send customer confirmation
    await fetch(`${supabaseUrl}/functions/v1/send-booking-email`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        booking: enrichedRecord,
        emailType: isRental ? "rental_customer_confirmation" : "tour_customer_confirmation",
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
        booking: enrichedRecord,
        emailType: isRental ? "rental_owner_notification" : "tour_owner_notification",
      }),
    });

    // Insert into review_queue — scheduled 24h after tour/pickup date
    const scheduledSend = new Date(tourDate);
    scheduledSend.setDate(scheduledSend.getDate() + 1);
    scheduledSend.setHours(10, 0, 0, 0);

    await supabase.from("review_queue").insert({
      booking_id: record.id,
      booking_type: isRental ? "rental" : "tour",
      customer_email: record.email,
      customer_name: record.full_name,
      service_type: record.service_type || (isRental ? "Vehicle Rental" : "Tour"),
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
