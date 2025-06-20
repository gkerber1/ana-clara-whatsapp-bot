import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Método não permitido");
  }

  const { message, phone } = req.body;
  if (!message || !phone) {
    return res.status(400).send("Campos obrigatórios");
  }

  const OPENAI_KEY = process.env.OPENAI_KEY;
  const ZAPI_INSTANCE_ID = process.env.ZAPI_INSTANCE_ID;
  const ZAPI_TOKEN = process.env.ZAPI_TOKEN;

  const PROMPT_BASE = `
Seu nome é Ana Clara. Você é uma consultora comercial do Grupo CredBens...
(continue o prompt normalmente)
`;

  try {
    const gpt = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: PROMPT_BASE },
          { role: "user", content: message },
        ],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const resposta = gpt.data.choices[0].message.content;

    await axios.post(
      `https://api.z-api.io/instances/${ZAPI_INSTANCE_ID}/token/${ZAPI_TOKEN}/send-text`,
      { phone, message: resposta }
    );

    return res.status(200).send("Mensagem enviada!");
  } catch (error) {
    console.error("Erro ao responder:", error.message);
    return res.status(500).send("Erro interno");
  }
}
