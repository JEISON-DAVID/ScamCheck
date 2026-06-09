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
            content: `Eres ScamCheck, experto en ciberseguridad y detección de fraudes. Analiza mensajes con criterio objetivo y equilibrado. Mensajes normales de bancos conocidos, empresas reales o comunicaciones cotidianas deben clasificarse como SEGURO. Solo marca como estafa si hay señales claras y concretas. Responde ÚNICAMENTE con JSON válido sin backticks: {"risk": <0-100>, "verdict": "<ESTAFA DETECTADA|POSIBLE ESTAFA|SOSPECHOSO|SEGURO>", "signals": ["señal1","señal2","señal3"], "recommendation": "<recomendación>", "type": "<tipo de estafa o Legítimo>"}. Criterios: SEGURO 0-20 mensaje normal sin alertas, SOSPECHOSO 21-50 algo inusual, POSIBLE ESTAFA 51-75 varias alertas, ESTAFA DETECTADA 76-100 urgencia artificial más link sospechoso más solicita datos personales.`
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
