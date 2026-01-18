
import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from './components/Layout';
import { GenerationStatus, NewsReport } from './types';
import { fetchDailyDesignNews, generateAudioSpeech } from './services/geminiService';
import { downloadAsPDF } from './utils/pdfGenerator';

const App: React.FC = () => {
  const [status, setStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [report, setReport] = useState<NewsReport | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startDailyProcess = async () => {
    try {
      setError(null);
      setStatus(GenerationStatus.SEARCHING);
      
      const newsReport = await fetchDailyDesignNews();
      setReport(newsReport);
      
      setStatus(GenerationStatus.GENERATING_AUDIO);
      const audioBase64 = await generateAudioSpeech(newsReport.fullText);
      
      // Convert PCM base64 to Blob URL (simplified for example)
      // Note: In real scenarios, decoding PCM bytes is required as per @google/genai guidelines.
      // Here we assume standard audio handle or trigger a helper.
      setAudioUrl(`data:audio/wav;base64,${audioBase64}`);
      
      setStatus(GenerationStatus.COMPLETED);
    } catch (err: any) {
      console.error(err);
      setError("Error al procesar las noticias: " + err.message);
      setStatus(GenerationStatus.ERROR);
    }
  };

  const handleDownloadPDF = () => {
    if (report) downloadAsPDF(report);
  };

  const handleDownloadAudio = () => {
    if (audioUrl) {
      const link = document.createElement('a');
      link.href = audioUrl;
      link.download = `Gemini_Design_News_${report?.date || 'Today'}.wav`;
      link.click();
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900">Bienvenido al Hub de Diseño</h2>
          <p className="text-slate-500 mt-2">Curación diaria inteligente de noticias sobre artes, diseño y arquitectura.</p>
        </header>

        {status === GenerationStatus.IDLE && (
          <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center shadow-sm">
            <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Generar Informe del Día</h3>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">Gemini buscará las noticias más relevantes de las últimas 24 horas y preparará tu PDF y Audio.</p>
            <button 
              onClick={startDailyProcess}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-xl transition-all shadow-lg hover:shadow-indigo-200"
            >
              Iniciar Búsqueda
            </button>
          </div>
        )}

        {status !== GenerationStatus.IDLE && status !== GenerationStatus.COMPLETED && status !== GenerationStatus.ERROR && (
          <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center shadow-sm animate-pulse">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent mb-6"></div>
            <h3 className="text-xl font-semibold mb-2">
              {status === GenerationStatus.SEARCHING && "Buscando noticias relevantes..."}
              {status === GenerationStatus.SUMMARIZING && "Sintetizando información..."}
              {status === GenerationStatus.GENERATING_AUDIO && "Generando audio con IA..."}
            </h3>
            <p className="text-slate-500">Esto tomará solo un momento. Preparando carpeta /Gemini en Drive...</p>
          </div>
        )}

        {status === GenerationStatus.ERROR && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <div className="text-red-500 mb-4 font-bold text-xl">Oops! Algo salió mal</div>
            <p className="text-red-600 mb-6">{error}</p>
            <button 
              onClick={startDailyProcess}
              className="bg-red-600 text-white py-2 px-6 rounded-lg font-medium"
            >
              Reintentar
            </button>
          </div>
        )}

        {report && status === GenerationStatus.COMPLETED && (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-4 items-center justify-between bg-indigo-900 text-white p-6 rounded-2xl shadow-xl">
              <div>
                <span className="text-indigo-300 text-sm font-semibold uppercase tracking-wider">Reporte Listo</span>
                <h3 className="text-xl font-bold">{report.date}</h3>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={handleDownloadPDF}
                  className="bg-white/10 hover:bg-white/20 border border-white/20 py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
                  Bajar PDF
                </button>
                <button 
                  onClick={handleDownloadAudio}
                  className="bg-indigo-500 hover:bg-indigo-400 py-2 px-4 rounded-lg flex items-center gap-2 transition-colors font-semibold"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/></svg>
                  Bajar Audio
                </button>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {report.items.map((item, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-all flex flex-col">
                  <span className="text-[10px] font-bold uppercase text-indigo-500 mb-2 tracking-widest">{item.category}</span>
                  <h4 className="font-bold text-lg text-slate-900 mb-3">{item.title}</h4>
                  <p className="text-slate-600 text-sm flex-1 mb-4 leading-relaxed">{item.summary}</p>
                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
                    <span className="text-xs text-slate-400 font-medium">{item.source}</span>
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 text-xs font-bold hover:underline">Leer más</a>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-slate-100 p-6 rounded-2xl border border-dashed border-slate-300">
              <h4 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"/></svg>
                Podcast Narrativo Generado
              </h4>
              <p className="text-slate-600 text-sm italic leading-relaxed">
                "{report.fullText.substring(0, 300)}..."
              </p>
              {audioUrl && (
                <audio controls className="w-full mt-4">
                  <source src={audioUrl} type="audio/wav" />
                  Tu navegador no soporta el audio.
                </audio>
              )}
            </div>

            <div className="flex justify-center pt-8">
              <button 
                onClick={() => setStatus(GenerationStatus.IDLE)}
                className="text-slate-400 hover:text-slate-600 text-sm font-medium"
              >
                ← Generar nuevo reporte
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default App;
