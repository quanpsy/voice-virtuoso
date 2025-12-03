import React from 'react';
import { SingingAnalysis } from '../types';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Music, CheckCircle2, AlertCircle, Mic2 } from 'lucide-react';

interface ResultsViewProps {
  data: SingingAnalysis;
  onReset: () => void;
}

const ResultsView: React.FC<ResultsViewProps> = ({ data, onReset }) => {
  const radarData = [
    { subject: 'Pitch', A: data.metrics.pitch, fullMark: 100 },
    { subject: 'Tone', A: data.metrics.tone, fullMark: 100 },
    { subject: 'Rhythm', A: data.metrics.rhythm, fullMark: 100 },
    { subject: 'Emotion', A: data.metrics.expression, fullMark: 100 },
  ];

  return (
    <div className="animate-fade-in space-y-8 w-full max-w-5xl mx-auto">
      
      {/* Header Section */}
      <div className="bg-gradient-to-r from-violet-900/50 to-indigo-900/50 rounded-2xl p-8 border border-violet-500/30 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500"></div>
        <h2 className="text-3xl font-bold text-white mb-2">{data.title}</h2>
        <div className="flex justify-center items-end gap-2 mb-4">
          <span className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-violet-200">
            {data.overallScore}
          </span>
          <span className="text-xl text-violet-300 font-medium mb-3">/ 100</span>
        </div>
        <p className="text-slate-300 max-w-2xl mx-auto text-lg leading-relaxed">"{data.summary}"</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Radar Chart */}
        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 backdrop-blur-sm">
          <h3 className="text-xl font-semibold text-slate-100 mb-6 flex items-center gap-2">
            <Music className="text-violet-400" size={20} />
            Vocal Profile
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#475569" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 14 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Score"
                  dataKey="A"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  fill="#8b5cf6"
                  fillOpacity={0.4}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 gap-4">
          <MetricCard title="Pitch Accuracy" score={data.metrics.pitch} color="bg-emerald-500" />
          <MetricCard title="Tone Quality" score={data.metrics.tone} color="bg-blue-500" />
          <MetricCard title="Rhythm & Timing" score={data.metrics.rhythm} color="bg-amber-500" />
          <MetricCard title="Emotional Expression" score={data.metrics.expression} color="bg-rose-500" />
        </div>
      </div>

      {/* Feedback Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Strengths */}
        <div className="bg-slate-800/50 rounded-xl p-6 border-t-4 border-t-emerald-500 shadow-lg">
          <h3 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
            <CheckCircle2 size={20} /> Strengths
          </h3>
          <ul className="space-y-3">
            {data.strengths.map((item, i) => (
              <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                <span className="text-emerald-500 mt-1">•</span> {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Improvements */}
        <div className="bg-slate-800/50 rounded-xl p-6 border-t-4 border-t-amber-500 shadow-lg">
          <h3 className="text-lg font-bold text-amber-400 mb-4 flex items-center gap-2">
            <AlertCircle size={20} /> Areas to Improve
          </h3>
          <ul className="space-y-3">
            {data.areasForImprovement.map((item, i) => (
              <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                <span className="text-amber-500 mt-1">•</span> {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Coaching */}
        <div className="bg-slate-800/50 rounded-xl p-6 border-t-4 border-t-violet-500 shadow-lg">
          <h3 className="text-lg font-bold text-violet-400 mb-4 flex items-center gap-2">
            <Mic2 size={20} /> Coach's Tips
          </h3>
          <ul className="space-y-3">
            {data.technicalSuggestions.map((item, i) => (
              <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                <span className="text-violet-500 mt-1">→</span> {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex justify-center pt-8 pb-12">
        <button
          onClick={onReset}
          className="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-full font-semibold transition-all transform hover:scale-105 shadow-xl"
        >
          Analyze Another Recording
        </button>
      </div>
    </div>
  );
};

const MetricCard: React.FC<{ title: string; score: number; color: string }> = ({ title, score, color }) => (
  <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 flex items-center justify-between">
    <div>
      <h4 className="text-slate-300 font-medium">{title}</h4>
    </div>
    <div className="flex items-center gap-4 w-1/2">
      <div className="flex-1 bg-slate-900 rounded-full h-2.5 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }}></div>
      </div>
      <span className="text-white font-bold w-8 text-right">{score}</span>
    </div>
  </div>
);

export default ResultsView;
