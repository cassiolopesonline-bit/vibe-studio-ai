import { GoogleGenAI, GenerateContentResponse, Modality, Type, VideoGenerationReferenceType } from "@google/genai";

// We'll initialize this inside the functions to ensure we get the latest API key
const getAI = () => {
  const apiKey = (process.env.GEMINI_API_KEY || process.env.API_KEY) as string;
  return new GoogleGenAI({ apiKey });
};

export async function gerarRoteiro(tema: string, duracao: string, tom: string, idioma: string) {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-flash-latest",
    contents: `Crie um roteiro estruturado para um vídeo de ${duracao} sobre o tema: "${tema}". 
    O tom deve ser ${tom} e o idioma ${idioma}.
    O roteiro deve ser dividido em cenas curtas (3 a 5 segundos cada).
    Para cada cena, forneça a narração e um prompt visual detalhado para geração de vídeo realista.
    Retorne estritamente em formato JSON com a seguinte estrutura:
    {
      "titulo": "Título do Vídeo",
      "cenas": [
        { "texto": "Narração da cena", "visual_prompt": "Prompt detalhado para IA de vídeo" }
      ]
    }`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          titulo: { type: Type.STRING },
          cenas: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                texto: { type: Type.STRING },
                visual_prompt: { type: Type.STRING }
              },
              required: ["texto", "visual_prompt"]
            }
          }
        },
        required: ["titulo", "cenas"]
      }
    }
  });

  return JSON.parse(response.text);
}

export async function generateImage(prompt: string) {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-image-preview',
    contents: {
      parts: [{ text: prompt + ", highly realistic, 8k, cinematic lighting, professional photography" }],
    },
    config: {
      imageConfig: {
        aspectRatio: "16:9",
        imageSize: "1K"
      }
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image generated");
}

export async function startVideoGeneration(prompt: string, base64Image?: string) {
  const ai = getAI();
  
  const config: any = {
    model: 'veo-3.1-lite-generate-preview',
    prompt: prompt,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '16:9'
    }
  };

  if (base64Image) {
    config.image = {
      imageBytes: base64Image.split(',')[1],
      mimeType: 'image/png'
    };
  }

  const operation = await ai.models.generateVideos(config);
  return operation;
}

export async function pollVideoOperation(operation: any) {
  const ai = getAI();
  let currentOp = operation;
  
  while (!currentOp.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    currentOp = await ai.operations.getVideosOperation({ operation: currentOp });
  }

  const downloadLink = currentOp.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) throw new Error("Video generation failed");

  const apiKey = (process.env.GEMINI_API_KEY || process.env.API_KEY) as string;
  const response = await fetch(downloadLink, {
    method: 'GET',
    headers: {
      'x-goog-api-key': apiKey,
    },
  });

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

export async function generateSpeech(text: string, voiceName: string = 'Kore') {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Diga de forma envolvente e misteriosa: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("Speech generation failed");
  
  const binary = atob(base64Audio);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}

export async function generateMusic(prompt: string) {
  const ai = getAI();
  const response = await ai.models.generateContentStream({
    model: "lyria-3-clip-preview",
    contents: `Generate a 30-second background track: ${prompt}. Cinematic, dark, atmospheric.`,
  });

  let audioBase64 = "";
  let mimeType = "audio/wav";

  for await (const chunk of response) {
    const parts = chunk.candidates?.[0]?.content?.parts;
    if (!parts) continue;
    for (const part of parts) {
      if (part.inlineData?.data) {
        if (!audioBase64 && part.inlineData.mimeType) {
          mimeType = part.inlineData.mimeType;
        }
        audioBase64 += part.inlineData.data;
      }
    }
  }

  if (!audioBase64) throw new Error("Music generation failed");

  const binary = atob(audioBase64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: mimeType });
  return URL.createObjectURL(blob);
}
