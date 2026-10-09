import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Square,
  Upload,
  Play,
  Pause,
  Trash2,
  RotateCcw,
  Volume2,
  VolumeX,
  Gauge,
  Sparkles,
  Music2,
  AlertCircle,
} from 'lucide-react';
import { useUserAudio } from '../hooks/useUserAudio';
import { useLanguage } from '../context/LanguageContext';

interface UserAudioRecorderProps {
  garbaId: string;
  title: string;
}

export const UserAudioRecorder: React.FC<UserAudioRecorderProps> = ({ garbaId, title }) => {
  const { t } = useLanguage();
  const { audioState, startRecording, stopRecording, uploadAudioFile, removeAudio } =
    useUserAudio(garbaId);


  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const speeds = [0.75, 1.0, 1.25, 1.5];

  // Sync playback speed and volume whenever audio element or speed changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [playbackSpeed, volume, isMuted, audioState.audioUrl]);

  // Audio Play / Pause handler
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadAudioFile(file);
    }
  };

  const formatSeconds = (sec: number) => {
    if (isNaN(sec)) return '00:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const formatRecordingTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleStartRecording = () => {
    startRecording();
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };


  return (
    <div className="bg-[#2A0505] rounded-3xl border-2 border-[#D4AF37] p-6 md:p-8 text-[#FFF8ED] shadow-2xl space-y-6 card-devotional-shadow relative overflow-hidden">
      
      {/* Background Decorative Lighting Accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D4AF37]/30">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#D4AF37] uppercase tracking-wider mb-1">
            <Music2 className="w-4 h-4 text-amber-400" />
            <span>{t.voiceRecorder.title}</span>
          </div>
          <h3 className="font-serif-heading text-lg sm:text-xl font-bold text-[#FFF8ED]">
            {title}
          </h3>
          <p className="text-xs text-[#FFF8ED]/80 mt-0.5">
            {t.voiceRecorder.subtitle}
          </p>
        </div>

        {audioState.hasAudio && (
          <div className="inline-flex items-center gap-2 bg-[#D4AF37]/20 border border-[#D4AF37] px-3 py-1.5 rounded-full text-xs font-bold text-[#D4AF37] self-start sm:self-center">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{t.voiceRecorder.yourVoiceReference}</span>
          </div>
        )}
      </div>

      {/* Error Message Alert */}
      {audioState.error && (
        <div className="flex items-center gap-2 bg-[#8B0000]/80 border border-red-400 px-4 py-3 rounded-2xl text-xs font-semibold text-red-100">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-300" />
          <span>{audioState.error}</span>
        </div>
      )}

      {/* RECORDING IN PROGRESS STATE */}
      {audioState.isRecording ? (
        <div className="bg-[#3B1111] border-2 border-red-500 rounded-2xl p-6 text-center space-y-4 shadow-inner animate-pulse">
          <div className="inline-flex items-center gap-3 bg-red-600/30 border border-red-500 px-4 py-2 rounded-full">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-ping"></span>
            <span className="text-sm font-bold text-red-200">
              {t.voiceRecorder.recordingInProgress} ({formatRecordingTimer(audioState.recordingTime)})
            </span>
          </div>

          <p className="text-xs text-[#FFF8ED]/80 font-gujarati">
            માઇક્રોફોન ચાલુ છે... તમારો ગરબાનો પાઠ બોલો અથવા ગાઓ.
          </p>

          <button
            onClick={stopRecording}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-[#FFF8ED] text-sm font-extrabold shadow-lg transition-all border border-red-400"
          >
            <Square className="w-4 h-4 fill-current" />
            <span>{t.voiceRecorder.stopRecording}</span>
          </button>
        </div>
      ) : audioState.hasAudio && audioState.audioUrl ? (
        /* PLAYBACK AUDIO STATE */
        <div className="space-y-6">
          <audio
            ref={audioRef}
            src={audioState.audioUrl}
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
          />

          {/* Player Main Controls Grid */}
          <div className="bg-[#1A0505] p-5 rounded-2xl border border-[#D4AF37]/50 space-y-4 shadow-inner">
            
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              
              {/* Play / Pause Toggle Button */}
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <button
                  onClick={togglePlay}
                  className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D4AF37] via-[#F3E5AB] to-[#AA771C] text-[#3B1111] flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all border-2 border-[#FFF8ED] shrink-0"
                >
                  {isPlaying ? (
                    <Pause className="w-7 h-7 fill-current" />
                  ) : (
                    <Play className="w-7 h-7 fill-current ml-1" />
                  )}
                </button>

                <div className="min-w-0">
                  <div className="text-sm font-bold text-[#FFF8ED] truncate">
                    {audioState.fileName || 'Voice Reference'}
                  </div>
                  <div className="text-xs text-[#D4AF37] font-mono">
                    {formatSeconds(currentTime)} / {formatSeconds(duration)}
                  </div>
                </div>
              </div>

              {/* Playback Speed Controls */}
              <div className="flex items-center gap-2 bg-[#2A0505] px-3 py-1.5 rounded-xl border border-[#D4AF37]/40 text-xs">
                <Gauge className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span className="text-[#D4AF37] font-bold uppercase">{t.audioPlayer.speed}:</span>
                <div className="flex gap-1">
                  {speeds.map((s) => (
                    <button
                      key={s}
                      onClick={() => setPlaybackSpeed(s)}
                      className={`px-2 py-0.5 rounded-lg font-bold font-mono transition-all ${
                        playbackSpeed === s
                          ? 'bg-[#D4AF37] text-[#3B1111]'
                          : 'bg-[#1A0505] text-[#FFF8ED]/80 hover:text-[#FFF8ED]'
                      }`}
                    >
                      {s}×
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Seek Timeline Slider */}
            <div className="space-y-1">
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="w-full accent-[#D4AF37] bg-[#3B1111] h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[11px] font-mono text-[#D4AF37]">
                <span>{formatSeconds(currentTime)}</span>
                <span>{formatSeconds(duration)}</span>
              </div>
            </div>

            {/* Volume Slider */}
            <div className="flex items-center justify-end gap-2 text-xs text-[#FFF8ED]/80 pt-2 border-t border-[#D4AF37]/20">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-1 hover:text-[#D4AF37] transition-colors"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-red-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-[#D4AF37]" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(parseFloat(e.target.value));
                  setIsMuted(false);
                }}
                className="w-24 accent-[#D4AF37] bg-[#3B1111] h-1.5 rounded-lg cursor-pointer"
              />
            </div>

          </div>

          {/* Action Row: Re-Record or Remove Audio */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              onClick={handleStartRecording}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#3B1111] text-[#D4AF37] border border-[#D4AF37]/60 text-xs font-bold hover:bg-[#8B0000] hover:text-[#FFF8ED] transition-all shadow-md"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{t.voiceRecorder.reRecord}</span>
            </button>

            <button
              onClick={removeAudio}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-900/40 text-red-200 border border-red-500/50 text-xs font-bold hover:bg-red-800 hover:text-white transition-all shadow-md"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-300" />
              <span>{t.voiceRecorder.removeAudio}</span>
            </button>
          </div>

        </div>
      ) : (
        /* NO AUDIO ADDED YET STATE - RECORD OR UPLOAD BUTTONS */
        <div className="space-y-4">
          <p className="text-xs text-[#FFF8ED]/70 italic">
            {t.voiceRecorder.noAudioAddedYet}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Live Microphone Record Button */}
            <button
              onClick={handleStartRecording}
              className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-[#8B0000] to-[#B71C1C] text-[#FFF8ED] border-2 border-[#D4AF37] font-bold text-sm shadow-xl hover:scale-102 active:scale-98 transition-all group"
            >
              <div className="w-10 h-10 rounded-full bg-[#3B1111] border border-[#D4AF37] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Mic className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <div className="text-left">
                <span className="block font-bold text-base">{t.voiceRecorder.startRecording}</span>
                <span className="block text-[11px] text-[#FFF8ED]/80 font-normal">
                  Record live via microphone
                </span>
              </div>
            </button>

            {/* Audio File Upload Button */}
            <button
              onClick={handleUploadClick}
              className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-[#1A0505] text-[#D4AF37] border-2 border-[#D4AF37]/70 font-bold text-sm shadow-xl hover:bg-[#3B1111] hover:text-[#FFF8ED] transition-all group"
            >
              <div className="w-10 h-10 rounded-full bg-[#3B1111] border border-[#D4AF37]/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Upload className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <div className="text-left">
                <span className="block font-bold text-base">{t.voiceRecorder.uploadAudio}</span>
                <span className="block text-[11px] text-[#FFF8ED]/70 font-normal">
                  MP3, M4A, WAV audio files
                </span>
              </div>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              className="hidden"
            />

          </div>
        </div>
      )}

    </div>
  );
};
