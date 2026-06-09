export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "No text" });

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: `Eres ScamCheck, experto en detección de estafas digitales. Responde ÚNICAMENTE con un objeto JSON válido sin backticks ni texto adicional con esta estructura: {"risk": <número 0-100>, "verdict": "<ESTAFA DETECTADA|POSIBLE ESTAFA|SOSPECHOSO|SEGURO>", "signals": ["señal1","señal2","señal3"], "recommendation": "<recomendación en español>", "type": "<tipo de estafa o Legítimo>"}`,
        messages: [{ role: "user", content: `Analiza este mensaje: "${text}"` }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Anthropic error:", JSON.stringify(data));
      return res.status(500).json({ error: "API error" });
    }

    const raw = data.content?.find((b) => b.type === "text")?.text || "";
    const clean = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return res.status(200).json(parsed);
  } catch (err) {
    console.error("Error:", err.message);
    return res.status(500).json({ error: "Error interno" });
  }
        }
