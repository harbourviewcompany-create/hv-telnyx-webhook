export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("POST only");

  try {
    const evt = req.body?.data?.event_type;

    if (evt === "message.received") {
      const p = req.body.data.payload;

      // Log inbound text
      console.log("Inbound from", p.from?.phone_number, ":", p.text);

      // Auto-reply via Telnyx Messages API
      const r = await fetch("https://api.telnyx.com/v2/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.TELNYX_API_KEY}`,
        },
        body: JSON.stringify({
          from: process.env.TELNYX_FROM_NUMBER,  // your Telnyx number (E.164)
          to: p.from.phone_number,               // the sender
          text:
            "Thanks for texting SednaMetrix! Want to book a quick call? https://cal.com/harbourview-g4ud0n — we’ll follow up shortly.",
        }),
      });

      console.log("Auto-reply status:", r.status);
    }

    // Always ACK fast
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("Webhook error:", e);
    return res.status(200).json({ ok: true });
  }
}
