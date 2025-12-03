import React, { useState, useRef } from 'react';
import { Upload, Mic, Loader2, Music4 } from 'lucide-react';
import { AppState, SingingAnalysis } from './types';
import { analyzeAudio, fileToBase64 } from './services/geminiService';
import AudioVisualizer from './components/AudioVisualizer';
import ResultsView from './components/ResultsView';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [file, setFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<SingingAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = e.target as any;
    if (target.files && target.files[0]) {
      const selectedFile = target.files[0];
      // Basic validation
      if (!selectedFile.type.startsWith('audio/')) {
        setError('Please upload a valid audio file.');
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
         setError('File size exceeds 10MB.');
         return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setAppState(AppState.ANALYZING);
    try {
      const base64Audio = await fileToBase64(file);
      const result = await analyzeAudio(base64Audio, file.type);
      setAnalysisResult(result);
      setAppState(AppState.SUCCESS);
    } catch (err) {
      console.error(err);
      setError('Failed to analyze audio. Please try again later or check your API key.');
      setAppState(AppState.ERROR);
    }
  };

  const handleReset = () => {
    setFile(null);
    setAnalysisResult(null);
    setAppState(AppState.IDLE);
    if (fileInputRef.current) {
        (fileInputRef.current as any).value = '';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-violet-500/30">
      
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-tr from-violet-600 to-indigo-600 p-2 rounded-lg">
              <Music4 size={24} className="text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              VocalVirtuoso
            </span>
          </div>
          <div className="text-sm text-slate-500 font-medium">
            AI Powered Vocal Coach
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12 flex flex-col items-center">
        
        {appState === AppState.IDLE && (
          <div className="w-full max-w-2xl text-center space-y-8 animate-fade-in-up">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
                Master Your Voice with <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
                  Precision Feedback
                </span>
              </h1>
              <p className="text-lg text-slate-400 max-w-lg mx-auto leading-relaxed">
                Upload your singing recording. Our AI analyzes your pitch, tone, and rhythm to give you a professional studio-grade review instantly.
              </p>
            </div>

            <div className="bg-slate-900 rounded-2xl border-2 border-dashed border-slate-700 hover:border-violet-500 transition-colors duration-300 p-10 group relative overflow-hidden">
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-slate-700 transition-colors">
                  <Upload className="text-violet-400" size={32} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {file ? file.name : "Click to Upload Recording"}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    {file ? "File ready for analysis" : "MP3, WAV, M4A up to 10MB"}
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
                {error}
              </div>
            )}

            {file && (
              <div className="space-y-6">
                <AudioVisualizer file={file} />
                
                <button
                  onClick={handleAnalyze}
                  className="w-full py-4 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-violet-900/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  Analyze Performance
                </button>
              </div>
            )}
          </div>
        )}

        {appState === AppState.ANALYZING && (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 animate-pulse">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-slate-800 border-t-violet-500 animate-spin"></div>
              <Mic className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-slate-600" size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Analyzing Frequencies...</h2>
              <p className="text-slate-400">Our AI Coach is listening to pitch, tone, and expression.</p>
            </div>
          </div>
        )}

        {appState === AppState.SUCCESS && analysisResult && (
          <ResultsView data={analysisResult} onReset={handleReset} />
        )}

        {appState === AppState.ERROR && (
           <div className="text-center py-20">
             <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-900/30 text-red-500 mb-4">
                <Loader2 className="animate-spin" size={32} />
             </div>
             <h2 className="text-2xl font-bold text-white mb-2">Analysis Failed</h2>
             <p className="text-slate-400 mb-6">{error || "Something went wrong."}</p>
             <button
               onClick={handleReset}
               className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
             >
               Try Again
             </button>
           </div>
        )}

      </main>
      
      {/* Footer */}
      <footer className="py-8 border-t border-slate-900 mt-auto">
        <div className="max-w-7xl mx-auto px-6 text-center text-slate-600 text-sm">
          <p>© {new Date().getFullYear()} VocalVirtuoso. Powered by Google Gemini 2.5 Flash.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;