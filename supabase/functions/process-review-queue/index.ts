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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get pending review requests
    const { data: pending, error } = await supabase
      .from("review_queue")
      .select("*")
      .lte("scheduled_send", new Date().toISOString())
      .is("sent_at", null)
      .limit(50);

    if (error) throw error;
    if (!pending || pending.length === 0) {
      return new Response(JSON.stringify({ processed: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch review platform settings
    const { data: settings } = await supabase
      .from("site_settings")
      .select("review_platforms")
      .limit(1)
      .single();

    const platforms = settings?.review_platforms || {};

    let processed = 0;

    for (const item of pending) {
      // Fetch the original booking for full details
      let bookingData: Record<string, any> = {
        customer_name: item.customer_name,
        customer_email: item.customer_email,
        email: item.customer_email,
        full_name: item.customer_name,
        service_type: item.service_type,
        booking_ref: "",
      };

      if (item.booking_id) {
        const table = item.booking_type === "rental" ? "rental_bookings" : "bookings";
        const { data: booking } = await supabase
          .from(table)
          .select("*")
          .eq("id", item.booking_id)
          .single();
        if (booking) {
          bookingData = { ...booking, email: booking.email || item.customer_email };
        }
      }

      const emailRes = await fetch(
        `${supabaseUrl}/functions/v1/send-booking-email`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${serviceRoleKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            booking: bookingData,
            emailType: "review_request",
            platforms,
          }),
        }
      );

      if (emailRes.ok) {
        await supabase
          .from("review_queue")
          .update({ sent_at: new Date().toISOString() })
          .eq("id", item.id);

        if (item.booking_id) {
          const table = item.booking_type === "rental" ? "rental_bookings" : "bookings";
          await supabase
            .from(table)
            .update({
              reviewed: true,
              review_sent_at: new Date().toISOString(),
            })
            .eq("id", item.booking_id);
        }

        processed++;
      } else {
        console.error(
          `Failed to send review email for ${item.id}:`,
          await emailRes.text()
        );
      }
    }

    return new Response(JSON.stringify({ processed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("process-review-queue error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
