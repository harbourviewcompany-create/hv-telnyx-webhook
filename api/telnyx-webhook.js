// Simple auto-reply webhook for Telnyx on Vercel
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("POST only");

  // Telnyx posts JSON; in Vercel it should already be parsed,
  // but handle both string/object to be safe.
  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
  const event = body?.data?.event_type;

  try {
    if (event === "message.received") {
      const p = body.data.payload;
      const fromNumber = p?.from?.phone_number;      // who texted you
      const textIn     = p?.text ?? "";              // their message

      // Build send-body; include messaging_profile_id if you add it as an env (optional)
      const sendBody = {
        from: process.env.TELNYX_FROM_NUMBER,        // your Telnyx number (E.164, e.g. +1613...)
        to: fromNumber,
        text: `Thanks! We got your message: "${textIn}". We'll follow up shortly. —SednaMetrix`
      };
      if (process.env.TELNYX_MESSAGING_PROFILE_ID) {
        sendBody.messaging_profile_id = process.env.TELNYX_MESSAGING_PROFILE_ID;
      }

      // Send SMS via Telnyx Messages API
      const r = await fetch("https://api.telnyx.com/v2/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.TELNYX_API_KEY}`
        },
        body: JSON.stringify(sendBody)
      });

      console.log("Auto-reply status:", r.status);
      if (!r.ok) console.error("Auto-reply error:", await r.text());
    }

    // Always ACK quickly so Telnyx doesn't retry
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Webhook error:", err);
    // Still return 200 so Telnyx doesn't hammer you
    return res.status(200).json({ ok: true });
  }
}
