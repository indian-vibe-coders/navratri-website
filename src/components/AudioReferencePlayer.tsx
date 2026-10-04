import React from 'react';
import { Play, Pause, Volume2, VolumeX, Gauge, Music } from 'lucide-react';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { useLanguage } from '../context/LanguageContext';
import type { AudioReference } from '../types';

interface AudioReferencePlayerProps {
  audioReference?: AudioReference;
  title?: string;
}

export const AudioReferencePlayer: React.FC<AudioReferencePlayerProps> = ({
  audioReference,
}) => {
  const { t } = useLanguage();
  const {
    isPlaying,
    currentTime,
    duration,
    playbackRate,
    volume,
    isMuted,
    togglePlayPause,
    seek,
    setSpeed,
    toggleMute,
    formatTime,
  } = useAudioPlayer(audioReference?.url);

  if (!audioReference || !audioReference.url) {
    return (
      <div className="w-full max-w-xl mx-auto my-4 bg-[#500000] border border-[#D4AF37]/40 rounded-xl p-3 text-center shadow-md">
        <p className="text-xs text-[#FFF7E8]/70 font-serif-title tracking-wider flex items-center justify-center gap-2">
          <Music className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>{t.audioPlayer.label} · {t.audioPlayer.comingSoon || 'Audio reference coming soon'}</span>
        </p>
      </div>
    );
  }

  const speedOptions = [0.75, 1, 1.25, 1.5];

  return (
    <div className="w-full max-w-xl mx-auto my-6 bg-[#500000] border border-[#D4AF37]/50 rounded-2xl p-4 md:p-5 shadow-xl relative overflow-hidden">
      {/* Header Labeling */}
      <div className="flex items-center justify-between pb-3 border-b border-[#D4AF37]/20">
        <div className="flex items-center gap-2.5">
          <span className="text-base text-[#D4AF37]">♪</span>
          <div>
            <h4 className="font-serif-title text-xs font-bold uppercase text-[#D4AF37] tracking-wider">
              AUDIO REFERENCE
            </h4>
            <p className="text-[11px] text-[#FFF7E8]/70 font-sans">
              Listen to the tune and rhythm
            </p>
          </div>
        </div>

        {/* Speed Selector */}
        <div className="flex items-center gap-1 bg-[#1A0303]/60 px-2 py-1 rounded-lg border border-[#D4AF37]/20">
          <Gauge className="w-3 h-3 text-[#D4AF37]/80" />
          {speedOptions.map((speed) => (
            <button
              key={speed}
              onClick={() => setSpeed(speed)}
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                playbackRate === speed
                  ? 'bg-[#D4AF37] text-[#3B0A0A]'
                  : 'text-[#FFF7E8]/60 hover:text-[#FFF7E8]'
              }`}
            >
              {speed}×
            </button>
          ))}
        </div>
      </div>

      {/* Main Playback Row */}
      <div className="mt-3 flex items-center gap-3">
        {/* Play/Pause Trigger */}
        <button
          onClick={togglePlayPause}
          className="w-10 h-10 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#3B0A0A] flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all shrink-0"
          aria-label={isPlaying ? "Pause audio reference" : "Play audio reference"}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 fill-[#3B0A0A]" />
          ) : (
            <Play className="w-5 h-5 fill-[#3B0A0A] ml-0.5" />
          )}
        </button>

        {/* Timeline Slider */}
        <div className="flex-1 space-y-1">
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={(e) => seek(Number(e.target.value))}
            className="w-full h-1.5 bg-[#1A0303] rounded-lg appearance-none cursor-pointer accent-[#D4AF37] focus:outline-none"
          />
          <div className="flex justify-between text-[10px] font-mono text-[#FFF7E8]/60">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Mute / Volume */}
        <button
          onClick={toggleMute}
          className="p-2 text-[#D4AF37] hover:text-[#FFF7E8] transition-colors shrink-0"
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted || volume === 0 ? (
            <VolumeX className="w-4 h-4" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
};
