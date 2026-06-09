export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { text } = req.body;

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
        system: `Eres ScamCheck, experto en detección de estafas. Responde SOLO con JSON válido sin backticks:
{"risk": <0-100>, "verdict": "<ESTAFA DETECTADA|POSIBLE ESTAFA|SOSPECHOSO|SEGURO>", "signals": ["señal1","señal2"], "recommendation": "<texto>", "type": "<tipo>"}`,
        messages: [{ role: "user", content: `Analiza: "${text}"` }],
      }),
    });

    const data = await response.json();
    const raw = data.content?.find((b) => b.type === "text")?.text || "";
    const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());

    return res.status(200).json(parsed);
  } catch (err) {
    return res.status(500).json({ error: "Error interno" });
  }
}
