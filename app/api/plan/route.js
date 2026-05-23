import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request) {
  try {
    const { items, style, budget, city } = await request.json();

    if (!items || items.length === 0) {
      return Response.json({ error: "No items provided" }, { status: 400 });
    }

    const keeps = items.filter((i) => i.decision === "keep").map((i) => i.label);
    const changes = items.filter((i) => i.decision === "change").map((i) => i.label);

    const systemPrompt = `You are a practical, budget-aware interior designer. You help people redesign a room using what they already have plus a few smart purchases. You always respect what the user wants to KEEP. For each item the user wants to CHANGE, you give two options: a "buy" suggestion (a specific, searchable product description and rough price range) and a "noBuy" alternative (how to reuse or restyle what they likely already have). Be concrete and realistic. Respond ONLY with valid JSON, no markdown, no preamble.`;

    const userPrompt = `Room style goal: ${style || "not specified"}.
Rough budget: ${budget || "flexible"}.
Items to KEEP (do not suggest replacing these): ${keeps.join(", ") || "none"}.
Items to CHANGE: ${changes.join(", ") || "none"}.

Return JSON in exactly this shape:
{
  "summary": "one or two sentence overview of the plan",
  "changes": [
    { "item": "item name", "buy": "specific searchable product + why", "cost": "$X-$Y", "noBuy": "how to reuse/restyle what they have" }
  ],
  "timeline": ["step 1 (free/no-buy first)", "step 2", "step 3"]
}`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content || "{}";
    const plan = JSON.parse(raw);

    // Attach free, never-breaking search links per change item
    const cityQ = city ? ` ${city}` : "";
    plan.changes = (plan.changes || []).map((c) => {
      const q = encodeURIComponent(c.buy?.split(".")[0] || c.item);
      return {
        ...c,
        links: {
          amazon: `https://www.amazon.com/s?k=${q}`,
          kijiji: `https://www.kijiji.ca/b-search?keywords=${q}`,
          google: `https://www.google.com/search?q=${q}${encodeURIComponent(cityQ)}`,
        },
      };
    });

    return Response.json(plan);
  } catch (err) {
    console.error("Plan generation error:", err);
    return Response.json(
      { error: "Could not generate plan", detail: String(err) },
      { status: 500 }
    );
  }
}
