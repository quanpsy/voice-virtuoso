import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';

interface AudioVisualizerProps {
  file: File | null;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ file }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<any | null>(null);
  const sourceRef = useRef<any | null>(null);
  const analyserRef = useRef<any | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationRef = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    if (!file || !audioRef.current) return;

    const url = URL.createObjectURL(file);
    (audioRef.current as any).src = url;

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  const initAudioContext = () => {
    if (audioContextRef.current) return;

    const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContext();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;

    if (audioRef.current) {
        // Only create source if it doesn't exist to prevent errors
        if (!sourceRef.current) {
            const source = ctx.createMediaElementSource(audioRef.current);
            source.connect(analyser);
            analyser.connect(ctx.destination);
            sourceRef.current = source;
        }
    }

    audioContextRef.current = ctx;
    analyserRef.current = analyser;
  };

  const draw = () => {
    if (!canvasRef.current || !analyserRef.current) return;

    const canvas = canvasRef.current;
    const ctx = (canvas as any).getContext('2d');
    if (!ctx) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const renderFrame = () => {
      animationRef.current = requestAnimationFrame(renderFrame);
      analyserRef.current!.getByteFrequencyData(dataArray);

      ctx.fillStyle = '#1e293b'; // Slate 800
      ctx.fillRect(0, 0, (canvas as any).width, (canvas as any).height);

      const barWidth = ((canvas as any).width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 1.5; // Scale down slightly

        // Gradient for bars
        const gradient = ctx.createLinearGradient(0, (canvas as any).height, 0, (canvas as any).height - barHeight);
        gradient.addColorStop(0, '#8b5cf6'); // Violet 500
        gradient.addColorStop(1, '#a855f7'); // Purple 500

        ctx.fillStyle = gradient;
        ctx.fillRect(x, (canvas as any).height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
    };

    renderFrame();
  };

  const togglePlay = async () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      (audioRef.current as any).pause();
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    } else {
      initAudioContext();
      if (audioContextRef.current?.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      (audioRef.current as any).play();
      draw();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime((audioRef.current as any).currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration((audioRef.current as any).duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700 w-full max-w-2xl mx-auto mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-700 rounded-full text-violet-400">
                <Volume2 size={20} />
            </div>
            <div>
                <h3 className="text-sm font-semibold text-slate-200">Recording Preview</h3>
                <p className="text-xs text-slate-400">{file?.name}</p>
            </div>
        </div>
      </div>

      <div className="relative h-32 w-full bg-slate-900 rounded-lg overflow-hidden mb-4 border border-slate-700/50">
        <canvas 
            ref={canvasRef} 
            width={600} 
            height={128} 
            className="w-full h-full"
        />
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={togglePlay}
          className="w-12 h-12 flex items-center justify-center rounded-full bg-violet-600 hover:bg-violet-500 text-white transition-all shadow-lg shadow-violet-900/20"
        >
          {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1"/>}
        </button>
        
        <div className="flex-1">
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={(e) => {
                if (audioRef.current) {
                    (audioRef.current as any).currentTime = parseFloat((e.target as any).value);
                }
            }}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1 font-mono">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        className="hidden"
      />
    </div>
  );
};

export default AudioVisualizer;