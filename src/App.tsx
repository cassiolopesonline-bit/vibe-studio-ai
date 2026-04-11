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
  CheckCircle2, 
  Clock, 
  Globe, 
  Volume2, 
  Music, 
  History, 
  Key, 
  Save, 
  Palette,
  RefreshCw, 
  Trash2,
  Maximize,
  ImageIcon,
  Type,
  Zap,
  Sun,
  Moon,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Tab = 'create' | 'preview' | 'edit' | 'settings' | 'inspiration';

interface Scene {
  cena_id: number;
  duracao_segundos: number;
  base_duracao?: number;
  velocidade?: number;
  narracao: string;
  query_busca_imagem: string;
  query_busca_video: string;
  usar_video: boolean;
  importancia: 'alta' | 'media' | 'low';
  timestamp_inicio: number;
}

interface Script {
  titulo: string;
  duracao_total_segundos: number;
  cenas: Scene[];
}

interface ProjectState {
  projectId: string;
  config: any;
  script: Script;
  versions: { version: number; path: string }[];
  createdAt: string;
}

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('create');
  const [loading, setLoading] = useState(false);
  const [inspirationVideos, setInspirationVideos] = useState<any[]>([]);
  const [verticalVideos, setVerticalVideos] = useState<any[]>([]);
  const [loadingInspiration, setLoadingInspiration] = useState(false);
  const [previewingMusic, setPreviewingMusic] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const MUSIC_PREVIEWS: Record<string, string> = {
    'Cinematográfico': 'https://cdn.pixabay.com/audio/2022/03/10/audio_c8c8a73456.mp3',
    'Misterioso': 'https://cdn.pixabay.com/audio/2022/02/22/audio_d0c6af1110.mp3',
    'Épico': 'https://cdn.pixabay.com/audio/2022/01/21/audio_31743c588f.mp3',
    'Suave': 'https://cdn.pixabay.com/audio/2022/03/15/audio_783910325b.mp3',
    'Tensão': 'https://cdn.pixabay.com/audio/2022/03/10/audio_c8c8a73456.mp3',
    'Lo-Fi': 'https://cdn.pixabay.com/audio/2022/05/27/audio_1ab0f0308d.mp3',
    'Cyberpunk': 'https://cdn.pixabay.com/audio/2022/03/10/audio_c8c8a73456.mp3',
    'Alegre': 'https://cdn.pixabay.com/audio/2022/03/15/audio_783910325b.mp3'
  };

  const handleToggleMusicPreview = (style: string) => {
    if (previewingMusic === style) {
      audioRef.current?.pause();
      setPreviewingMusic(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const url = MUSIC_PREVIEWS[style];
      if (url) {
        audioRef.current = new Audio(url);
        audioRef.current.volume = musicVolume / 100;
        audioRef.current.play();
        setPreviewingMusic(style);
        audioRef.current.onended = () => setPreviewingMusic(null);
      }
    }
  };

  const fetchInspiration = async () => {
    setLoadingInspiration(true);
    try {
      const resH = await fetch('https://api.pexels.com/videos/search?query=cinematic+landscape+tech&per_page=6&orientation=landscape', {
        headers: { Authorization: '5332242a64100000010000100778f654446548779913994326578654' }
      });
      const dataH = await resH.json();
      if (dataH.videos && dataH.videos.length > 0) setInspirationVideos(dataH.videos);

      const resV = await fetch('https://api.pexels.com/videos/search?query=fashion+lifestyle+vlog&per_page=4&orientation=portrait', {
        headers: { Authorization: '5332242a64100000010000100778f654446548779913994326578654' }
      });
      const dataV = await resV.json();
      if (dataV.videos && dataV.videos.length > 0) setVerticalVideos(dataV.videos);
    } catch (error) {
      console.error("Erro ao carregar inspiração");
    } finally {
      setLoadingInspiration(false);
    }
  };

  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [project, setProject] = useState<ProjectState | null>(null);
  const [savedProjects, setSavedProjects] = useState<ProjectState[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [editSubTab, setEditSubTab] = useState<'subtitles' | 'music'>('subtitles');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Config
  const [theme, setTheme] = useState('');
  const [template, setTemplate] = useState('Livre');
  const [duration, setDuration] = useState(1);
  const [tone, setTone] = useState('Informativo');
  const [language, setLanguage] = useState('Português BR');
  
  // VOZES ATUALIZADAS (GRATUITAS)
  const [voice, setVoice] = useState('pt-BR-AntonioNeural');
  
  const [voicePitch, setVoicePitch] = useState(0);
  const [voiceSpeed, setVoiceSpeed] = useState(1.0);
  const [visualStyle, setVisualStyle] = useState('Cinematográfico');
  const [resolution, setResolution] = useState('1080p');
  const [subtitleStyle, setSubtitleStyle] = useState('default');
  const [narrationVolume, setNarrationVolume] = useState(100);

  const visualStyles = [
    { id: 'Cinematográfico', name: 'Cinematográfico', img: 'https://picsum.photos/seed/movie/200/120' },
    { id: 'Realista', name: 'Realista', img: 'https://picsum.photos/seed/real/200/120' },
    { id: 'Cartoon/Desenho', name: '3D Cartoon', img: 'https://picsum.photos/seed/disney/200/120' },
    { id: 'Anime', name: 'Anime', img: 'https://picsum.photos/seed/anime/200/120' },
    { id: 'Cyberpunk', name: 'Cyberpunk', img: 'https://picsum.photos/seed/cyber/200/120' },
    { id: 'Pintura a Óleo', name: 'Pintura', img: 'https://picsum.photos/seed/paint/200/120' },
  ];

  const subtitleStyles = [
    { id: 'none', name: 'Sem Legenda', class: '' },
    { id: 'default', name: 'Padrão', class: 'font-sans' },
    { id: 'bold-yellow', name: 'Destaque Amarelo', class: 'font-black text-yellow-400 uppercase' },
    { id: 'glow-blue', name: 'Brilho Azul', class: 'font-bold text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]' },
  ];

  const trendingTopics = [
    { title: "A história de superação de um atleta", icon: "🏆", category: "Esporte" },
    { title: "Curiosidades sobre o espaço sideral", icon: "🚀", category: "Ciência" },
    { title: "Como a IA vai mudar o mundo em 2026", icon: "🤖", category: "Tecnologia" },
    { title: "Os mistérios da Fossa das Marianas", icon: "🌊", category: "Oceano" },
  ];

  const [musicVolume, setMusicVolume] = useState(30);
  const [musicStyle, setMusicStyle] = useState('Cinematográfico');
  const [musicDucking, setMusicDucking] = useState(true);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [useAIImages, setUseAIImages] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [subtitleColor, setSubtitleColor] = useState('#FFFFFF');

  const [script, setScript] = useState<Script | null>(null);
  const [isScriptEditable, setIsScriptEditable] = useState(false);

  const [apiKeys, setApiKeys] = useState({ gemini: '', pexels: '', pixabay: '', google_tts: '' });

  const addLog = (msg: string) => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  const handleGenerateScript = async () => {
    setLoading(true);
    setError(null);
    setLogs([]);
    addLog("Iniciando geração de roteiro com Gemini 2.0 Flash...");
    try {
      const res = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tema: theme, duracao: duration, tom: tone, idioma: language, template })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setScript(data);
      addLog("Roteiro gerado com sucesso!");
    } catch (err: any) {
      setError(err.message);
      addLog(`Erro: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleProduceVideo = async () => {
    if (!script) return;
    setLoading(true);
    setError(null);
    addLog("Iniciando produção do vídeo com voz gratuita...");
    try {
      const config = { 
        voice, voicePitch, voiceSpeed, narrationVolume, musicVolume, musicStyle, musicDucking,
        theme, template, duration, tone, language,
        aspectRatio, useAIImages, showSubtitles, subtitleColor, visualStyle,
        resolution, subtitleStyle
      };
      const res = await fetch('/api/produce-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config, script })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setProject(data);
      setActiveTab('preview');
      addLog("Vídeo produzido com sucesso!");
    } catch (err: any) {
      setError(err.message);
      addLog(`Erro na produção: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      if (!data.error) setSavedProjects(data);
    } catch (err) { console.error(err); }
  };

  const handleLoadProject = (proj: ProjectState) => {
    setProject(proj);
    setScript(proj.script);
    setActiveTab('preview');
    setShowHistory(false);
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });
      fetchProjects();
      if (project?.projectId === projectId) setProject(null);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    document.documentElement.classList.toggle('light', !darkMode);
  }, [darkMode]);

  useEffect(() => {
    fetchProjects();
    fetchInspiration();
  }, []);

  const handleSurpriseMe = () => {
    const tones = ['Informativo', 'Misterioso', 'Dramático', 'Épico'];
    setTone(tones[Math.floor(Math.random() * tones.length)]);
    setDuration(Math.floor(Math.random() * 3) + 1);
    addLog("Configurações randomizadas!");
  };

  const handleSaveProject = async () => {
    if (!script) return;
    setLoading(true);
    try {
      const config = { voice, theme, template, duration, tone, language };
      const res = await fetch('/api/save-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: project?.projectId, config, script })
      });
      const data = await res.json();
      setProject(data);
      addLog("Projeto salvo!");
      fetchProjects();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditVideo = async (action: string, data: any) => {
    if (!project) return;
    setLoading(true);
    addLog(`Executando edição: ${action}...`);
    try {
      const res = await fetch('/api/edit-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: project.projectId, action, data })
      });
      const result = await res.json();
      setProject(result);
      addLog("Edição concluída!");
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${darkMode ? 'bg-zinc-950 text-zinc-100' : 'bg-zinc-50 text-zinc-900'}`}>
      <nav className={`fixed top-0 left-0 right-0 h-16 z-50 px-8 flex items-center justify-between border-b transition-all ${darkMode ? 'bg-zinc-950/80 border-white/5 backdrop-blur-md' : 'bg-white/80 border-black/5 backdrop-blur-md'}`}>
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="p-2 bg-brand/10 border border-brand/20 rounded-lg">
            <Video className="w-5 h-5 text-brand" />
          </div>
          <h1 className="text-xl font-display font-bold">VibeStudio <span className="text-brand">AI</span></h1>
        </div>
        
        <div className={`flex p-1 rounded-2xl border ${darkMode ? 'bg-zinc-900/50 border-white/5' : 'bg-zinc-100/50 border-black/5'}`}>
          {(['create', 'preview', 'edit', 'settings'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === tab ? (darkMode ? 'bg-zinc-800 text-white shadow-lg' : 'bg-white text-zinc-900 shadow-md') : 'text-zinc-500'}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-xl border border-white/5 text-zinc-500"><Sun className="w-5 h-5" /></button>
          <button onClick={() => setShowHistory(!showHistory)} className="p-2 rounded-xl border border-white/5 text-zinc-500"><History className="w-5 h-5" /></button>
        </div>
      </nav>

      <main className="pt-28 pb-32 max-w-7xl mx-auto px-8">
        <AnimatePresence mode="wait">
          {activeTab === 'create' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Sidebar Config */}
              <div className="lg:col-span-4 space-y-8">
                <div className="p-8 glass-card rounded-[2.5rem] space-y-8">
                  <h3 className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Configuração Pro</h3>
                  
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-[10px] uppercase font-bold flex items-center gap-2">Template</label>
                      <select value={template} onChange={(e) => setTemplate(e.target.value)} className="w-full border rounded-2xl p-4 text-sm bg-zinc-950/50 border-white/5">
                        {['Livre', 'Tutorial', 'Review', 'Vlog', 'Documentário'].map(t => <option key={t} className="bg-zinc-900">{t}</option>)}
                      </select>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] uppercase font-bold flex items-center gap-2">Voz do Narrador (Grátis)</label>
                      <select 
                        value={voice} 
                        onChange={(e) => setVoice(e.target.value)} 
                        className="w-full border rounded-2xl p-4 text-sm bg-zinc-950/50 border-white/5 text-brand font-bold"
                      >
                        <option value="pt-BR-AntonioNeural" className="bg-zinc-900">Antonio (Masculino)</option>
                        <option value="pt-BR-DonatoNeural" className="bg-zinc-900">Donato (Masculino)</option>
                        <option value="pt-BR-FranciscaNeural" className="bg-zinc-900">Francisca (Feminino)</option>
                        <option value="pt-BR-ThalitaNeural" className="bg-zinc-900">Thalita (Feminino)</option>
                        <option value="en-US-GuyNeural" className="bg-zinc-900">English Guy (USA)</option>
                        <option value="en-US-AriaNeural" className="bg-zinc-900">English Lady (USA)</option>
                      </select>
                      <p className="text-[9px] text-zinc-500 italic mt-1">* Vozes neurais Microsoft de alta qualidade sem custo.</p>
                    </div>

                    <div className="space-y-3">
                       <label className="text-[10px] uppercase font-bold">Duração ({duration} min)</label>
                       <input type="range" min="1" max="10" value={duration} onChange={(e) => setDuration(parseInt(e.target.value))} className="w-full accent-brand" />
                    </div>
                  </div>
                </div>

                <div className="p-8 glass-card rounded-[2.5rem] space-y-4">
                  <h3 className="text-[10px] font-mono uppercase text-zinc-500">Log de Produção</h3>
                  <div className="h-40 overflow-y-auto font-mono text-[10px] text-zinc-500 space-y-2">
                    {logs.map((log, i) => <p key={i} className={log.includes('Erro') ? 'text-red-400' : 'text-brand'}>{log}</p>)}
                  </div>
                </div>
              </div>

              {/* Main Text Area */}
              <div className="lg:col-span-8 space-y-8">
                <div className="p-10 glass rounded-[3rem] space-y-10 relative overflow-hidden">
                  <div className="space-y-6">
                    <h2 className="text-5xl font-display font-bold leading-tight">Crie vídeos <span className="text-brand">Sem Limites.</span></h2>
                    <div className="relative group">
                      <textarea 
                        value={theme} onChange={(e) => setTheme(e.target.value)}
                        placeholder="Descreva o que você quer ver e ouvir..."
                        className="w-full h-48 border rounded-[2rem] p-8 text-xl focus:outline-none focus:border-brand/30 transition-all bg-zinc-950/40 border-white/5 resize-none shadow-inner"
                      />
                      <div className="absolute bottom-6 right-8 flex gap-3">
                        <button onClick={handleSurpriseMe} className="p-3 bg-zinc-900 rounded-xl border border-white/5"><Zap className="w-4 h-4" /></button>
                        <button onClick={handleGenerateScript} disabled={loading} className="px-6 py-3 bg-white/5 text-xs font-bold rounded-xl border border-white/5 flex items-center gap-2">
                          {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Sparkles className="w-4 h-4 text-brand" />} Roteiro
                        </button>
                        <button onClick={handleProduceVideo} disabled={!script || loading} className="px-8 py-3 bg-brand text-zinc-950 text-xs font-bold rounded-xl flex items-center gap-2 shadow-xl shadow-brand/20">
                           Produzir Vídeo
                        </button>
                      </div>
                    </div>
                  </div>

                  {script && (
                    <div className="space-y-8 pt-10 border-t border-white/5">
                      <div className="flex justify-between items-center">
                        <h3 className="text-2xl font-bold">{script.titulo}</h3>
                        <button onClick={() => setIsScriptEditable(!isScriptEditable)} className="px-4 py-2 rounded-xl text-[10px] font-bold bg-brand/10 text-brand">
                          {isScriptEditable ? 'Salvar Edição' : 'Editar Cenas'}
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {script.cenas.map((cena, i) => (
                          <div key={i} className="p-6 glass-card rounded-[2rem] border border-white/5">
                            <span className="text-[9px] font-mono text-zinc-500 uppercase">Cena {cena.cena_id}</span>
                            <p className="text-sm mt-2 leading-relaxed text-zinc-300">{cena.narracao}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'preview' && (
            <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
              {project ? (
                <div className="max-w-4xl mx-auto space-y-8">
                  <div className="aspect-video rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl">
                    <video src={project.versions[project.versions.length - 1].path} controls className="w-full h-full" />
                  </div>
                  <div className="flex justify-between items-center glass p-10 rounded-[3rem]">
                    <h3 className="text-2xl font-bold">{project.script.titulo}</h3>
                    <a href={project.versions[project.versions.length - 1].path} download className="px-10 py-5 bg-white text-zinc-950 font-bold rounded-2xl flex items-center gap-3">
                      <Download className="w-5 h-5" /> Baixar MP4
                    </a>
                  </div>
                </div>
              ) : (
                <div className="text-center py-40 text-zinc-500">Produza um vídeo para ver o resultado aqui.</div>
              )}
            </motion.div>
          )}
          
          {/* Outras tabs mantidas simplificadas ou conforme necessidade */}
        </AnimatePresence>
      </main>
      
      {/* Toast de Erro */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ y: 50 }} animate={{ y: 0 }} className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-red-600 text-white p-4 rounded-xl flex items-center gap-3 z-[200]">
            <AlertCircle /> <p className="text-sm font-bold">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
