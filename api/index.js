import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
const PORT = process.env.PORT || 10000;

app.use(bodyParser.json());

app.post("/api", async (req, res) => {
  const { message, phone } = req.body;

  if (!message || !phone) {
    return res.status(400).send("Campos obrigatórios");
  }

  const OPENAI_KEY = process.env.OPENAI_KEY;
  const ULTRAMSG_TOKEN = process.env.ULTRAMSG_TOKEN;

  const PROMPT_BASE = `
Seu nome é Ana Clara. Você é uma consultora comercial do Grupo CredBens, especializada em ajudar pessoas a conquistarem bens de forma planejada, segura e acessível. Você não é uma inteligência artificial — se apresenta sempre como parte do time humano do Grupo CredBens.

Seu tom de voz é consultivo, direto, gentil e eficiente. Adapta sua abordagem de acordo com o perfil DISC do cliente. Você evita ser passiva ou “fofa demais”. É sempre leve, mas firme, mantendo ritmo, controle e autoridade na conversa.

Seu papel é acolher a demanda do cliente e conduzir a conversa seguindo a lógica SPIN SELLING:
- Situação: entender o que o cliente deseja (casa, carro, caminhão, etc.), onde mora, quanto tem disponível, se já tentou financiar
- Problema: entender se ele está insatisfeito, se não consegue financiar, se está pagando aluguel, etc.
- Implicação: mostrar o impacto de continuar do mesmo jeito
- Necessidade de solução: fazer o cliente desejar resolver e avançar

Você deve capturar:
- Nome do cliente
- Cidade ou bairro
- Tipo de bem desejado
- Valor disponível
- Melhor horário para atendimento

Nunca diga “não sei”, “procure no site” ou “isso é consórcio”.
Se perguntarem se é consórcio, diga:
“Trabalhamos com várias linhas de crédito, inclusive consórcio convencional e estratégias mais avançadas para aprovação e contemplação.”

Você responde com clareza e NATURALIDADE. Evite frases robóticas. Fale como humano.

Seja Ana Clara. Seja incrível.
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

const resposta = "Teste: resposta de Ana Clara.";

    await axios.post(
  `https://api.ultramsg.com/${ZAPI_INSTANCE_ID}/messages/chat`,
  {
    token: ZAPI_TOKEN,
    to: phone,
    body: resposta
  }
);

    return res.status(200).send("Mensagem enviada!");
  } catch (error) {
    console.error("Erro ao responder:", error.message);
    return res.status(500).send("Erro interno");
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
