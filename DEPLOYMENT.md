# VibeStudio AI - Guia de Implantação (Deployment)

Este guia explica como colocar o **VibeStudio AI** no ar usando o GitHub e plataformas como **Railway** ou **Vercel**.

---

## 1. Preparando o Repositório no GitHub

1.  **Crie uma conta no GitHub** (se ainda não tiver).
2.  **Crie um novo repositório** (ex: `vibestudio-ai`).
3.  **Suba o código:**
    *   No AI Studio, vá em **Settings > Export to GitHub** ou baixe o ZIP.
    *   Se baixar o ZIP, extraia e use os comandos no seu terminal:
        ```bash
        git init
        git add .
        git commit -m "Initial commit"
        git branch -M main
        git remote add origin https://github.com/SEU_USUARIO/vibestudio-ai.git
        git push -u origin main
        ```

---

## 2. Opção Recomendada: Railway (Melhor para Vídeos)

O **Railway** é ideal para este app porque ele permite rodar servidores Express com `ffmpeg` sem limites de tempo curtos (como o Vercel).

1.  Crie uma conta em [railway.app](https://railway.app/).
2.  Clique em **New Project > Deploy from GitHub repo**.
3.  Selecione seu repositório `vibestudio-ai`.
4.  **Configure as Variáveis de Ambiente:** Vá em **Variables** e adicione:
    *   `GEMINI_API_KEY`: Sua chave do Google AI.
    *   `PEXELS_API_KEY`: Sua chave do Pexels.
    *   `PIXABAY_API_KEY`: Sua chave do Pixabay.
    *   `GOOGLE_APPLICATION_CREDENTIALS_JSON`: O conteúdo do seu arquivo JSON de credenciais do Google Cloud (veja nota abaixo).
5.  O Railway detectará o `package.json` e rodará o `npm run dev` (ou você pode configurar para rodar o build).

---

## 3. Opção: Vercel (Para o Frontend)

O Vercel é ótimo para sites estáticos, mas tem limitações para processamento de vídeo pesado.

1.  Crie uma conta em [vercel.com](https://vercel.com/).
2.  Clique em **Add New > Project** e conecte seu GitHub.
3.  Selecione o repositório.
4.  **Configurações:**
    *   **Framework Preset:** Vite.
    *   **Environment Variables:** Adicione as mesmas chaves citadas acima.
5.  **Nota:** Se o vídeo demorar mais de 10 segundos para gerar, o Vercel pode dar erro de "Timeout" na conta gratuita.

---

## 4. Configurações Importantes

### Credenciais do Google Cloud (TTS)
Para a narração funcionar em servidores, você não deve subir o arquivo `.json` no GitHub por segurança.
1.  Copie o conteúdo do seu arquivo JSON.
2.  No servidor (Railway/Vercel), crie uma variável chamada `GOOGLE_CREDENTIALS_CONTENT`.
3.  O código do app já está preparado para ler isso ou você pode ajustar o arquivo `src/lib/server/audio.ts` para ler da variável de ambiente.

### FFmpeg
Adicionamos a biblioteca `ffmpeg-static` ao projeto. Isso garante que o `ffmpeg` funcione automaticamente no Railway ou Vercel sem que você precise instalar nada no sistema operacional do servidor.

---

## 5. Resumo das APIs Necessárias

Certifique-se de ter as chaves:
*   **Google AI (Gemini):** [ai.google.dev](https://ai.google.dev/)
*   **Pexels:** [pexels.com/api](https://www.pexels.com/api/)
*   **Pixabay:** [pixabay.com/api/docs](https://pixabay.com/api/docs/)
*   **Google Cloud TTS:** [console.cloud.google.com](https://console.cloud.google.com/)

---

Pronto! Seu estúdio de IA agora está pronto para o mundo. 🚀
