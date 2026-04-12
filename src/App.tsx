import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Video, 
  Settings, 
  Edit3, 
  Download, 
  Play, 
  Loader2, 
  AlertCircle, 
  Clock, 
  Globe, 
  Volume2, 
  Music, 
  History, 
  Zap,
  Sun,
  Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Tab = 'create' | 'preview' | 'edit' | 'settings';

interface Scene {
  cena_id: number;
  duracao_segundos: number;
  narracao: string;
}

interface Script {
  titulo: string;
  duracao_total_segundos: number;
  cenas: Scene[];
}

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('create');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [project, setProject] = useState<any>(null);
  const [showHistory, setShowHistory] = useState(false);

  // Configurações do Vídeo
  const [theme, setTheme] = useState('');
  const [template, setTemplate] = useState('Livre');
  const [duration, setDuration] = useState(1);
  const [tone, setTone] = useState('Informativo');
  const [language, setLanguage] = useState('Português BR');
  const [voice, setVoice] = useState('pt-BR-AntonioNeural'); // Padrão Grátis
  const [script, setScript] = useState<Script | null>(null);

  const addLog = (msg: string) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 20)]);

  const handleGenerateScript = async () => {
    setLoading(true);
    setError(null);
    addLog("Gerando roteiro com IA...");
    try {
      const res = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tema: theme, duracao: duration, tom: tone, idioma: language, template })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setScript(data);
      addLog("Roteiro pronto!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProduceVideo = async () => {
    if (!script) return;
    setLoading(true);
    setError(null);
    addLog("Produzindo vídeo com voz gratuita...");
    try {
      const config = { voice, theme, duration, tone, language };
      const res = await fetch('/api/produce-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config, script })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setProject(data);
      setActiveTab('preview');
      addLog("Vídeo concluído!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.documentElement.classList.toggle('light', !darkMode);
  }, [darkMode]);

  return (
    <div className={`min-h-screen font-sans transition-all ${darkMode ? 'bg-zinc-950 text-zinc-100' : 'bg-zinc-50 text-zinc-900'}`}>
      {/* Barra de Navegação */}
      <nav className={`fixed top-0 w-full h-16 z-50 px-8 flex items-center justify-between border-b ${darkMode ? 'bg-zinc-950/80 border-white/5 backdrop-blur-md' : 'bg-white/80 border-black/5 backdrop-blur-md'}`}>
        <div className="flex items-center gap-2">
          <Video className="w-6 h-6 text-brand" />
          <h1 className="text-xl font-bold">VibeStudio <span className="text-brand">AI</span></h1>
        </div>
        
        <div className="flex gap-4">
          <button onClick={() => setActiveTab('create')} className={`px-4 py-2 rounded-lg text-xs font-bold ${activeTab === 'create' ? 'bg-brand text-white' : 'text-zinc-500'}`}>CRIAR</button>
          <button onClick={() => setActiveTab('preview')} className={`px-4 py-2 rounded-lg text-xs font-bold ${activeTab === 'preview' ? 'bg-brand text-white' : 'text-zinc-500'}`}>VER VÍDEO</button>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setDarkMode(!darkMode)} className="p-2 border border-white/10 rounded-lg">{darkMode ? <Sun size={18}/> : <Moon size={18}/>}</button>
        </div>
      </nav>

      <main className="pt-24 pb-20 max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Coluna de Configuração */}
          <div className="lg:col-span-4 space-y-6">
            <div className={`p-6 rounded-3xl border ${darkMode ? 'bg-zinc-900 border-white/5' : 'bg-white border-black/5'}`}>
              <h3 className="text-xs font-bold text-zinc-500 uppercase mb-6">Configuração de Voz</h3>
              
              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase text-zinc-400">Narrador Gratuito</label>
                <select 
                  value={voice} 
                  onChange={(e) => setVoice(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-sm text-brand font-bold"
                >
                  <option value="pt-BR-AntonioNeural">Antonio (Masculino)</option>
                  <option value="pt-BR-DonatoNeural">Donato (Masculino)</option>
                  <option value="pt-BR-FranciscaNeural">Francisca (Feminino)</option>
                  <option value="pt-BR-ThalitaNeural">Thalita (Feminino)</option>
                </select>
                <p className="text-[9px] text-zinc-500 italic">* Sem necessidade de chaves Google Cloud.</p>
              </div>

              <div className="mt-6 space-y-4">
                <label className="text-[10px] font-bold uppercase text-zinc-400">Duração: {duration} min</label>
                <input type="range" min="1" max="10" value={duration} onChange={(e) => setDuration(parseInt(e.target.value))} className="w-full accent-brand" />
              </div>
            </div>

            <div className={`p-6 rounded-3xl border h-48 overflow-y-auto ${darkMode ? 'bg-zinc-900 border-white/5 text-zinc-500' : 'bg-white border-black/5 text-zinc-400'}`}>
              <h4 className="text-[10px] font-bold uppercase mb-2">Logs do Servidor</h4>
              {logs.map((log, i) => <p key={i} className="text-[9px] mb-1 font-mono">{log}</p>)}
            </div>
          </div>

          {/* Coluna Principal */}
          <div className="lg:col-span-8 space-y-6">
            <div className={`p-8 rounded-[2.5rem] border ${darkMode ? 'bg-zinc-900 border-white/5' : 'bg-white border-black/5'}`}>
              <h2 className="text-3xl font-bold mb-6">O que vamos criar hoje?</h2>
              <textarea 
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="Ex: Um mistério assustador no fundo do mar..."
                className="w-full h-40 bg-transparent border border-white/10 rounded-2xl p-6 text-lg focus:border-brand outline-none resize-none"
              />
              
              <div className="flex gap-4 mt-6">
                <button 
                  onClick={handleGenerateScript}
                  disabled={loading || !theme}
                  className="flex-1 py-4 bg-zinc-800 text-white rounded-xl font-bold hover:bg-zinc-700 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={18}/>} GERAR ROTEIRO
                </button>
                <button 
                  onClick={handleProduceVideo}
                  disabled={loading || !script}
                  className="flex-1 py-4 bg-brand text-white rounded-xl font-bold hover:bg-brand-hover transition-all shadow-lg shadow-brand/20"
                >
                  PRODUZIR VÍDEO
                </button>
              </div>
            </div>

            {/* Preview do Roteiro */}
            {script && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <h3 className="text-xl font-bold px-2">{script.titulo}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {script.cenas.map((cena, i) => (
                    <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                      <span className="text-[9px] text-zinc-500 font-mono">CENA {cena.cena_id}</span>
                      <p className="text-xs text-zinc-300 mt-2">{cena.narracao}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

        </div>
      </main>

      {/* Preview de Vídeo Final */}
      {activeTab === 'preview' && project && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-6">
          <div className="max-w-4xl w-full space-y-6">
            <video src={project.versions[project.versions.length - 1].path} controls className="w-full rounded-3xl shadow-2xl" />
            <div className="flex justify-between">
              <button onClick={() => setActiveTab('create')} className="text-white font-bold px-6 py-3 border border-white/20 rounded-xl">VOLTAR</button>
              <a href={project.versions[project.versions.length - 1].path} download className="bg-brand text-white font-bold px-8 py-3 rounded-xl flex items-center gap-2"><Download size={18}/> BAIXAR MP4</a>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-4 rounded-2xl flex items-center gap-3 z-[200] shadow-xl">
          <AlertCircle /> <span className="font-bold">{error}</span>
        </div>
      )}
    </div>
  );
}
