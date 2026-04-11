import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

export async function gerarRoteiro(tema: string, duracao: number, tom: string, idioma: string, template: string = "Livre") {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is required");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          titulo: { type: SchemaType.STRING },
          duracao_total_segundos: { type: SchemaType.NUMBER },
          cenas: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                cena_id: { type: SchemaType.NUMBER },
                duracao_segundos: { type: SchemaType.NUMBER },
                narracao: { type: SchemaType.STRING },
                query_busca_imagem: { type: SchemaType.STRING },
                query_busca_video: { type: SchemaType.STRING },
                usar_video: { type: SchemaType.BOOLEAN },
                importancia: { type: SchemaType.STRING },
                timestamp_inicio: { type: SchemaType.NUMBER }
              },
              required: ["cena_id", "duracao_segundos", "narracao", "query_busca_imagem", "query_busca_video", "usar_video", "importancia", "timestamp_inicio"]
            }
          }
        },
        required: ["titulo", "duracao_total_segundos", "cenas"]
      }
    }
  });

  const prompt = `Crie um roteiro estruturado para um vídeo de ${duracao} minutos sobre o tema: "${tema}". 
    O estilo do vídeo deve seguir o template: "${template}".
    O tom deve ser ${tom} e o idioma ${idioma}.
    O roteiro deve ser dividido em cenas calculadas para preencher exatamente a duração solicitada.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return JSON.parse(response.text());
}
