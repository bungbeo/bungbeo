
import React, { useState, useRef } from 'react';
import { VideoSlotState, SlotStatus, Resolution, AspectRatio } from '../types';
import { generateVideoFromImage } from '../services/geminiService';

interface VideoSlotProps {
  slot: VideoSlotState;
  onUpdate: (id: number, updates: Partial<VideoSlotState>) => void;
  onReset: (id: number) => void;
}

const VideoSlot: React.FC<VideoSlotProps> = ({ slot, onUpdate, onReset }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      const base64 = result.split(',')[1];
      onUpdate(slot.id, {
        imageUrl: result,
        imageBytes: base64,
        status: SlotStatus.READY,
        error: null
      });
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!slot.imageBytes) return;

    onUpdate(slot.id, {
      status: SlotStatus.GENERATING,
      progress: "Initializing...",
      error: null
    });

    try {
      const videoUrl = await generateVideoFromImage(
        slot.imageBytes,
        slot.settings,
        (progress) => onUpdate(slot.id, { progress })
      );
      onUpdate(slot.id, {
        status: SlotStatus.COMPLETED,
        videoUrl: videoUrl,
        progress: "Completed!"
      });
    } catch (err: any) {
      onUpdate(slot.id, {
        status: SlotStatus.ERROR,
        error: err.message || "An unexpected error occurred."
      });
    }
  };

  const updateSetting = <K extends keyof VideoSlotState['settings']>(
    key: K,
    value: VideoSlotState['settings'][K]
  ) => {
    onUpdate(slot.id, {
      settings: { ...slot.settings, [key]: value }
    });
  };

  const isIdle = slot.status === SlotStatus.IDLE;
  const isGenerating = slot.status === SlotStatus.GENERATING;
  const isCompleted = slot.status === SlotStatus.COMPLETED;

  return (
    <div className="glass-panel rounded-2xl p-5 flex flex-col h-full shadow-2xl transition-all hover:border-blue-500/50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
          Luồng {slot.id}
        </h3>
        {isCompleted && (
          <button 
            onClick={() => onReset(slot.id)}
            className="text-xs text-blue-400 hover:text-blue-300 font-medium"
          >
            Làm mới
          </button>
        )}
      </div>

      {/* Preview Area */}
      <div className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden mb-5 border border-slate-700/50 flex items-center justify-center">
        {!slot.imageUrl && !isGenerating && (
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-xs text-slate-500">Chưa có ảnh</p>
          </div>
        )}

        {slot.imageUrl && !isGenerating && !isCompleted && (
          <img src={slot.imageUrl} alt="Preview" className="w-full h-full object-contain" />
        )}

        {isGenerating && (
          <div className="text-center p-6 space-y-4 w-full">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
            </div>
            <p className="text-sm text-blue-400 animate-pulse font-medium">{slot.progress}</p>
            <p className="text-[10px] text-slate-500">Video generation typically takes 2-4 minutes</p>
          </div>
        )}

        {isCompleted && slot.videoUrl && (
          <video 
            src={slot.videoUrl} 
            controls 
            className="w-full h-full bg-black"
            poster={slot.imageUrl || undefined}
          />
        )}

        {slot.status === SlotStatus.ERROR && (
          <div className="absolute inset-0 bg-red-900/20 backdrop-blur-sm flex items-center justify-center p-4 text-center">
             <div className="space-y-2">
                <p className="text-xs text-red-400 font-bold uppercase">Lỗi</p>
                <p className="text-[11px] text-white/80 leading-relaxed">{slot.error}</p>
                <button 
                  onClick={() => onUpdate(slot.id, { status: SlotStatus.READY, error: null })}
                  className="px-3 py-1 bg-red-500 rounded-lg text-[10px] font-bold"
                >
                  Thử lại
                </button>
             </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex-1 space-y-4">
        {/* Quality and Aspect Ratio Row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] text-slate-500 font-bold uppercase">Chất lượng</label>
            <select 
              disabled={isGenerating || isCompleted}
              value={slot.settings.resolution}
              onChange={(e) => updateSetting('resolution', e.target.value as Resolution)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-2 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
            >
              <option value="720p">720p (Fast)</option>
              <option value="1080p">1080p (Pro)</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-slate-500 font-bold uppercase">Khung hình</label>
            <select 
              disabled={isGenerating || isCompleted}
              value={slot.settings.aspectRatio}
              onChange={(e) => updateSetting('aspectRatio', e.target.value as AspectRatio)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-2 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
            >
              <option value="16:9">Landscape (16:9)</option>
              <option value="9:16">Portrait (9:16)</option>
            </select>
          </div>
        </div>

        {/* Prompt field */}
        <div className="space-y-1">
          <label className="text-[10px] text-slate-500 font-bold uppercase">Mô tả (Grok-style)</label>
          <textarea 
            disabled={isGenerating || isCompleted}
            value={slot.settings.prompt}
            onChange={(e) => updateSetting('prompt', e.target.value)}
            placeholder="Mô tả hành động của video..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs min-h-[60px] resize-none focus:ring-1 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-5 pt-4 border-t border-slate-700/50 flex flex-col gap-2">
        {!isCompleted && (
          <button 
            disabled={isGenerating}
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-slate-700 hover:bg-slate-600 disabled:opacity-50 py-2.5 rounded-xl text-xs font-bold transition-colors"
          >
            {slot.imageUrl ? 'Thay đổi ảnh' : 'Tải ảnh lên'}
          </button>
        )}
        
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleImageUpload} 
        />

        {slot.imageUrl && !isCompleted && (
          <button 
            disabled={isGenerating}
            onClick={handleGenerate}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-900/20"
          >
            {isGenerating ? 'Đang khởi tạo...' : 'Bắt đầu chuyển đổi'}
          </button>
        )}

        {isCompleted && slot.videoUrl && (
          <a 
            href={slot.videoUrl} 
            download={`video-slot-${slot.id}.mp4`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-green-600 hover:bg-green-500 py-2.5 rounded-xl text-xs font-bold text-center transition-all shadow-lg shadow-green-900/20"
          >
            Tải video về
          </a>
        )}
      </div>
    </div>
  );
};

export default VideoSlot;
