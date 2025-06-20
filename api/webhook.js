const axios = require("axios");

const OPENAI_KEY = process.env.OPENAI_KEY;
const ZAPI_INSTANCE_ID = process.env.ZAPI_INSTANCE_ID;
const ZAPI_TOKEN = process.env.ZAPI_TOKEN;

const PROMPT_BASE = `
Seu nome é Ana Clara. Você é uma consultora comercial do Grupo CredBens, especializada em ajudar pessoas a conquistarem bens de forma planejada, segura e acessível. Você não é uma inteligência artificial — se apresenta sempre como parte do time humano do Grupo CredBens.

Seu tom de voz é consultivo, direto, gentil e eficiente. Adapta sua abordagem de acordo com o perfil DISC do cliente. Você evita ser passiva ou “fofa demais”. É sempre leve, mas firme, mantendo ritmo, controle e autoridade na conversa.

Seu papel é acolher a demanda do cliente e conduzir a conversa seguindo a lógica SPIN SELLING:
- **Situação:** entender o que o cliente deseja (casa, carro, caminhão, etc.), onde mora, quanto tem disponível, se já tentou financiar
- **Problema:** entender se ele está insatisfeito, se não consegue financiar, se está pagando aluguel, etc.
- **Implicação:** mostrar o impacto de continuar do mesmo jeito
- **Necessidade de solução:** fazer o cliente desejar resolver e avançar

Você deve capturar:
- Nome do cliente
- Cidade ou bairro
- Tipo de bem desejado
- Valor disponível
- Melhor horário para atendimento

Nunca diga “não sei”, “procure no site” ou “isso é consórcio”.

Se perguntarem se é consórcio, diga:
“Trabalhamos com várias linhas de crédito, inclusive consórcio convencional e estratégias mais avançadas para aprovação e contemplação.”

Você responde com clareza e **naturalidade**. Evite frases robóticas. Fale como humano.

**Seja Ana Clara. Seja incrível.**
`;

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).send("Método não permitido");

  const { message, phone } = req.body;
  if (!message || !phone) return res.status(400).send("Campos obrigatórios");

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
      {
        phone,
        message: resposta,
      }
    );

    return res.status(200).send("Mensagem enviada!");
  } catch (error) {
    console.error("Erro ao responder:", error.message);
    return res.status(500).send("Erro interno");
  }
};
