export default async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  try {
    const { text } = await req.json();

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

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Error interno" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
};

export const config = { path: "/api/analyze" };
