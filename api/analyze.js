export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "No text" });

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 1000,
        messages: [
          {
            role: "system",
            content: `Eres ScamCheck, experto en detección de estafas digitales. Responde ÚNICAMENTE con JSON válido sin backticks: {"risk": <0-100>, "verdict": "<ESTAFA DETECTADA|POSIBLE ESTAFA|SOSPECHOSO|SEGURO>", "signals": ["señal1","señal2","señal3"], "recommendation": "<recomendación>", "type": "<tipo>"}`
          },
          {
            role: "user",
            content: `Analiza este mensaje: "${text}"`
          }
        ],
      }),
    });

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || "";
    const clean = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return res.status(200).json(parsed);
  } catch (err) {
    console.error("Error:", err.message);
    return res.status(500).json({ error: "Error interno" });
  }
}
