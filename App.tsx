
import React, { useState, useEffect } from 'react';
import { VideoSlotState, SlotStatus } from './types';
import VideoSlot from './components/VideoSlot';

const INITIAL_SETTINGS = {
  resolution: '720p' as const,
  aspectRatio: '16:9' as const,
  prompt: ''
};

const createInitialSlot = (id: number): VideoSlotState => ({
  id,
  status: SlotStatus.IDLE,
  imageUrl: null,
  imageBytes: null,
  videoUrl: null,
  progress: '',
  error: null,
  settings: { ...INITIAL_SETTINGS }
});

const App: React.FC = () => {
  const [slots, setSlots] = useState<VideoSlotState[]>([
    createInitialSlot(1),
    createInitialSlot(2),
    createInitialSlot(3),
    createInitialSlot(4)
  ]);
  const [hasKey, setHasKey] = useState<boolean>(false);

  useEffect(() => {
    const checkKey = async () => {
      // @ts-ignore - injected by environment
      const selected = await window.aistudio.hasSelectedApiKey();
      setHasKey(selected);
    };
    checkKey();
  }, []);

  const handleUpdateSlot = (id: number, updates: Partial<VideoSlotState>) => {
    setSlots(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const handleResetSlot = (id: number) => {
    setSlots(prev => prev.map(s => s.id === id ? createInitialSlot(id) : s));
  };

  const handleSelectKey = async () => {
    // @ts-ignore - injected by environment
    await window.aistudio.openSelectKey();
    setHasKey(true); // Assume success per instructions
  };

  if (!hasKey) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#0f172a]">
        <div className="glass-panel p-10 rounded-3xl max-w-lg w-full text-center space-y-6 shadow-2xl">
          <div className="w-20 h-20 bg-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-12">
            <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">VeoFlow Studio</h1>
          <p className="text-slate-400 leading-relaxed">
            Chào mừng đến với trình chuyển đổi hình ảnh thành video AI. Để bắt đầu, vui lòng chọn API Key từ Google AI Studio (yêu cầu thanh toán để sử dụng Veo).
          </p>
          <div className="space-y-4">
            <button 
              onClick={handleSelectKey}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition-all transform hover:scale-[1.02] shadow-xl shadow-blue-500/20"
            >
              Chọn API Key & Bắt đầu
            </button>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">
              Tìm hiểu thêm tại <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-blue-400 underline">tài liệu thanh toán</a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-panel border-b border-white/5 py-4 px-8 mb-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              VeoFlow Parallel Studio
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-green-500/10 rounded-full border border-green-500/20">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-bold text-green-500 uppercase">Live: 4 Luồng song song</span>
            </div>
            <button 
              onClick={handleSelectKey}
              className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Cài đặt Key
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {slots.map(slot => (
            <VideoSlot 
              key={slot.id} 
              slot={slot} 
              onUpdate={handleUpdateSlot}
              onReset={handleResetSlot}
            />
          ))}
        </div>

        {/* Info Section */}
        <section className="mt-12 glass-panel p-8 rounded-3xl border border-white/5">
          <h2 className="text-lg font-bold mb-4 text-blue-400">Hướng dẫn sử dụng</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <div className="text-blue-500 font-black text-2xl">01</div>
              <p className="text-sm font-semibold">Tải ảnh lên từng luồng</p>
              <p className="text-xs text-slate-500 leading-relaxed">Chọn một hình ảnh chất lượng cao để làm khung hình bắt đầu cho video của bạn.</p>
            </div>
            <div className="space-y-2">
              <div className="text-indigo-500 font-black text-2xl">02</div>
              <p className="text-sm font-semibold">Cấu hình thông số</p>
              <p className="text-xs text-slate-500 leading-relaxed">Điều chỉnh độ phân giải và tỷ lệ khung hình. Thêm mô tả để định hướng chuyển động cho AI.</p>
            </div>
            <div className="space-y-2">
              <div className="text-purple-500 font-black text-2xl">03</div>
              <p className="text-sm font-semibold">Bắt đầu & Tải về</p>
              <p className="text-xs text-slate-500 leading-relaxed">Hệ thống hỗ trợ xử lý 4 video cùng lúc. Sau khi hoàn tất, bạn có thể xem trước và tải về ngay lập tức.</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-16 text-center text-slate-600 text-[10px] uppercase tracking-widest pb-8">
        Powered by Gemini Veo 3.1 &bull; Parallel Processing Engine v1.0
      </footer>
    </div>
  );
};

export default App;
