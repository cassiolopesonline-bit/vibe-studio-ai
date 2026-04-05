import { GoogleGenerativeAI, Type } from "@google/generative-ai";

export async function gerarRoteiro(tema: string, duracao: number, tom: string, idioma: string, template: string = "Livre") {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is required");

  const ai = new GoogleGenerativeAI(apiKey);
  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Crie um roteiro estruturado para um vídeo de ${duracao} minutos sobre o tema: "${tema}". 
    O estilo do vídeo deve seguir o template: "${template}".
    O tom deve ser ${tom} e o idioma ${idioma}.
    O roteiro deve ser dividido em cenas calculadas para preencher exatamente a duração solicitada.
    
    Para cada cena, forneça:
    - cena_id: número sequencial
    - duracao_segundos: duração da cena (3 a 10 segundos)
    - narracao: texto que será narrado
    - query_busca_imagem: termo de busca para imagem no Pexels
    - query_busca_video: termo de busca para vídeo no Pexels
    - usar_video: booleano (true para cenas de abertura e clímax, false para demais)
    - importancia: "alta", "media" ou "baixa"
    - timestamp_inicio: quando a cena começa no vídeo
    
    Retorne estritamente em formato JSON com a seguinte estrutura:
    {
      "titulo": "Título do Vídeo",
      "duracao_total_segundos": total_segundos,
      "cenas": [
        { 
          "cena_id": 1, 
          "duracao_segundos": 5, 
          "narracao": "...", 
          "query_busca_imagem": "...", 
          "query_busca_video": "...", 
          "usar_video": true, 
          "importancia": "alta", 
          "timestamp_inicio": 0 
        },
        ...
      ]
    }`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          titulo: { type: Type.STRING },
          duracao_total_segundos: { type: Type.NUMBER },
          cenas: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                cena_id: { type: Type.NUMBER },
                duracao_segundos: { type: Type.NUMBER },
                narracao: { type: Type.STRING },
                query_busca_imagem: { type: Type.STRING },
                query_busca_video: { type: Type.STRING },
                usar_video: { type: Type.BOOLEAN },
                importancia: { type: Type.STRING, enum: ["alta", "media", "baixa"] },
                timestamp_inicio: { type: Type.NUMBER }
              },
              required: ["cena_id", "duracao_segundos", "narracao", "query_busca_imagem", "query_busca_video", "usar_video", "importancia", "timestamp_inicio"]
            }
          }
        },
        required: ["titulo", "duracao_total_segundos", "cenas"]
      }
    }
  });

  const response = await model;
  return JSON.parse(response.text);
}
