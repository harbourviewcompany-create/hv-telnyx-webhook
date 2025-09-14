export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("POST only");
  console.log("Telnyx event:", req.body?.data?.event_type);
  return res.status(200).json({ ok: true });
}
