import React, { useState, useEffect, useRef } from 'react';
import { Heart, Mic, Square, Upload, Play, Pause, Trophy, Trash2, Music2, CheckCircle2 } from 'lucide-react';
import {
  type AudioComment,
  fetchComments,
  postComment,
  setCommentLiked,
  deleteComment,
} from '../lib/apiClient';

const sortByLikes = (list: AudioComment[]) =>
  [...list].sort((a, b) => b.likes - a.likes || b.timestamp - a.timestamp);

interface CommunityAudioCommentsProps {
  garbaId: string;
  garbaTitle: string;
}

export const CommunityAudioComments: React.FC<CommunityAudioCommentsProps> = ({
  garbaId,
}) => {
  const [comments, setComments] = useState<AudioComment[]>([]);
  const [activeMode, setActiveMode] = useState<'none' | 'record' | 'upload'>('none');
  const [userName, setUserName] = useState('');
  const [commentText, setCommentText] = useState('');

  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [attachedAudio, setAttachedAudio] = useState<Blob | null>(null);
  const [uploadedAudioName, setUploadedAudioName] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewPlaying, setPreviewPlaying] = useState(false);

  // Audio Playback State for comments
  const [playingCommentId, setPlayingCommentId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    loadComments();
    resetForm();
  }, [garbaId]);

  const resetForm = () => {
    setActiveMode('none');
    setAttachedAudio(null);
    setUploadedAudioName(null);
    setRecordingSeconds(0);
    setCommentText('');
    setIsRecording(false);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
  };

  const loadComments = async () => {
    try {
      setComments(sortByLikes(await fetchComments(garbaId)));
    } catch (err) {
      console.warn('Failed to load community audio references:', err);
      setComments([]);
    }
  };

  // Start Mic Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        setAttachedAudio(audioBlob);
        setUploadedAudioName('Voice_Reference.webm');
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone access error:', err);
      alert('Microphone access is required to record. You can also upload an audio file!');
    }
  };

  // Stop Mic Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
  };

  // Toggle Preview of recorded/uploaded audio
  const togglePreviewAudio = () => {
    if (!attachedAudio) return;
    if (previewPlaying) {
      if (previewAudioRef.current) previewAudioRef.current.pause();
      setPreviewPlaying(false);
    } else {
      const url = URL.createObjectURL(attachedAudio);
      const audio = new Audio(url);
      previewAudioRef.current = audio;
      audio.play();
      setPreviewPlaying(true);
      audio.onended = () => setPreviewPlaying(false);
    }
  };

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('Audio file size should be less than 10MB.');
      return;
    }

    setAttachedAudio(file);
    setUploadedAudioName(file.name);
    setRecordingSeconds(0);
  };

  // Submit Audio Reference
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!attachedAudio && !commentText.trim()) {
      alert('Please record or upload an audio reference.');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await postComment(garbaId, {
        authorName: userName.trim() || 'Devotee',
        commentText,
        audio: attachedAudio || undefined,
        audioName: uploadedAudioName || undefined,
        audioDuration: recordingSeconds || undefined,
      });
      setComments((prev) => sortByLikes([created, ...prev]));
      resetForm();
    } catch (err) {
      alert(`Could not submit audio reference: ${(err as Error).message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Upvote / Like
  const handleLike = async (commentId: string) => {
    const target = comments.find((c) => c.id === commentId);
    if (!target) return;
    try {
      const likes = await setCommentLiked(commentId, !target.userLiked);
      setComments((prev) =>
        sortByLikes(prev.map((c) => (c.id === commentId ? { ...c, likes, userLiked: !target.userLiked } : c)))
      );
    } catch (err) {
      alert((err as Error).message);
    }
  };

  // Play / Pause Comment Audio
  const togglePlayCommentAudio = (commentId: string, audioUrl?: string) => {
    if (!audioUrl) return;

    if (playingCommentId === commentId) {
      if (audioRef.current) audioRef.current.pause();
      setPlayingCommentId(null);
    } else {
      if (audioRef.current) audioRef.current.pause();
      const newAudio = new Audio(audioUrl);
      audioRef.current = newAudio;
      newAudio.play();
      setPlayingCommentId(commentId);
      newAudio.onended = () => setPlayingCommentId(null);
    }
  };

  // Delete Comment (Owner Verified)
  const handleDelete = async (commentId: string) => {
    if (confirm('Delete your audio reference?')) {
      try {
        await deleteComment(commentId);
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      } catch (err) {
        alert(`Could not delete: ${(err as Error).message}`);
      }
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="w-full max-w-xl mx-auto my-12 space-y-10">
      {/* 1. Share Audio Reference Section */}
      <div className="bg-[#500000] border border-[#D4AF37]/50 rounded-2xl p-6 shadow-xl text-center">
        <h3 className="font-serif-title text-sm font-bold text-[#D4AF37] uppercase tracking-wider mb-1">
          SHARE AN AUDIO REFERENCE
        </h3>
        <p className="text-xs text-[#FFF7E8]/80 font-sans max-w-md mx-auto mb-6">
          Know the tune? Record or upload a short audio reference to help others learn this Garba.
        </p>

        {activeMode === 'none' && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setActiveMode('record')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#3B0A0A] font-bold text-xs shadow-md hover:brightness-105 transition-all"
            >
              <Mic className="w-4 h-4" />
              <span>Record Audio</span>
            </button>
            <button
              onClick={() => setActiveMode('upload')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#600000] text-[#FFF7E8] border border-[#D4AF37]/50 font-bold text-xs shadow-md hover:bg-[#800000] transition-all"
            >
              <Upload className="w-4 h-4 text-[#D4AF37]" />
              <span>Upload Audio</span>
            </button>
          </div>
        )}

        {/* Recording Interface */}
        {activeMode === 'record' && (
          <form onSubmit={handleSubmitComment} className="space-y-4 pt-2 border-t border-[#D4AF37]/20 text-left">
            <div className="flex items-center justify-between">
              <span className="text-xs font-serif-title font-bold text-[#D4AF37] flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>RECORD AUDIO REFERENCE</span>
              </span>
              <button
                type="button"
                onClick={resetForm}
                className="text-[11px] text-[#FFF7E8]/60 hover:text-[#FFF7E8]"
              >
                Cancel
              </button>
            </div>

            {!attachedAudio ? (
              <div className="bg-[#1A0303]/60 p-4 rounded-xl border border-[#D4AF37]/20 text-center space-y-3">
                {!isRecording ? (
                  <>
                    <p className="text-xs text-[#FFF7E8]/70 font-sans">Record a short reference for this Garba.</p>
                    <button
                      type="button"
                      onClick={startRecording}
                      className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#5A0808] text-[#FFF7E8] border border-[#D4AF37]/40 text-xs font-bold hover:bg-[#800000] transition-colors"
                    >
                      <Mic className="w-4 h-4 text-[#D4AF37]" />
                      <span>Start Recording</span>
                    </button>
                  </>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2 text-xs font-bold text-red-400 animate-pulse">
                      <Square className="w-3 h-3 fill-current" />
                      <span>Recording... ({formatTime(recordingSeconds)})</span>
                    </div>
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="px-4 py-1.5 rounded-lg bg-red-800 text-white text-xs font-bold shadow hover:bg-red-700"
                    >
                      Stop Recording
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-[#1A0303]/80 p-3 rounded-xl border border-[#D4AF37]/30 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-medium text-[#D4AF37]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Voice Reference Ready ({formatTime(recordingSeconds)})</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={togglePreviewAudio}
                    className="p-1.5 rounded bg-[#5A0808] text-[#D4AF37] hover:text-[#FFF7E8]"
                    title="Play Preview"
                  >
                    {previewPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAttachedAudio(null);
                      setRecordingSeconds(0);
                    }}
                    className="text-[10px] text-red-300 hover:underline"
                  >
                    Re-record
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Your Name (optional)"
                className="w-full bg-[#1A0303]/80 text-[#FFF7E8] placeholder-[#FFF7E8]/40 px-3.5 py-2 rounded-xl border border-[#D4AF37]/30 text-xs outline-none focus:border-[#D4AF37]"
              />
              <textarea
                rows={2}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Optional notes about rhythm or tune..."
                className="w-full bg-[#1A0303]/80 text-[#FFF7E8] placeholder-[#FFF7E8]/40 p-3 rounded-xl border border-[#D4AF37]/30 text-xs outline-none focus:border-[#D4AF37]"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || (!attachedAudio && !commentText.trim())}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#3B0A0A] font-bold text-xs shadow hover:brightness-105 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Reference'}
            </button>
          </form>
        )}

        {/* Upload Interface */}
        {activeMode === 'upload' && (
          <form onSubmit={handleSubmitComment} className="space-y-4 pt-2 border-t border-[#D4AF37]/20 text-left">
            <div className="flex items-center justify-between">
              <span className="text-xs font-serif-title font-bold text-[#D4AF37] flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>UPLOAD AUDIO REFERENCE</span>
              </span>
              <button
                type="button"
                onClick={resetForm}
                className="text-[11px] text-[#FFF7E8]/60 hover:text-[#FFF7E8]"
              >
                Cancel
              </button>
            </div>

            <div className="bg-[#1A0303]/60 p-4 rounded-xl border border-[#D4AF37]/20 text-center space-y-2">
              <p className="text-xs text-[#FFF7E8]/70 font-sans">Upload a short audio clip that demonstrates the tune or rhythm.</p>
              <input
                type="file"
                ref={fileInputRef}
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#5A0808] text-[#FFF7E8] border border-[#D4AF37]/40 text-xs font-bold hover:bg-[#800000] transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>{uploadedAudioName || 'Choose Audio File'}</span>
              </button>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Your Name (optional)"
                className="w-full bg-[#1A0303]/80 text-[#FFF7E8] placeholder-[#FFF7E8]/40 px-3.5 py-2 rounded-xl border border-[#D4AF37]/30 text-xs outline-none focus:border-[#D4AF37]"
              />
              <textarea
                rows={2}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Optional notes about rhythm or tune..."
                className="w-full bg-[#1A0303]/80 text-[#FFF7E8] placeholder-[#FFF7E8]/40 p-3 rounded-xl border border-[#D4AF37]/30 text-xs outline-none focus:border-[#D4AF37]"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !attachedAudio}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#3B0A0A] font-bold text-xs shadow hover:brightness-105 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Uploading...' : 'Upload Reference'}
            </button>
          </form>
        )}
      </div>

      {/* 2. Community Audio References List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-2">
          <div>
            <h4 className="font-serif-title text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
              COMMUNITY AUDIO REFERENCES
            </h4>
            <p className="text-[11px] text-[#FFF7E8]/60 font-sans">
              Audio references shared by the Garba community.
            </p>
          </div>
          <span className="text-[10px] font-mono font-bold bg-[#250505] text-[#D4AF37] px-2.5 py-0.5 rounded-full border border-[#D4AF37]/30">
            {comments.length}
          </span>
        </div>

        {comments.length > 0 ? (
          <div className="space-y-3">
            {comments.map((comment, index) => {
              const isTopRanked = index === 0 && comment.likes > 0;
              const isPlaying = playingCommentId === comment.id;

              return (
                <div
                  key={comment.id}
                  className="bg-[#250505]/60 border border-[#D4AF37]/25 rounded-xl p-4 shadow-sm backdrop-blur-sm space-y-2.5 transition-all hover:border-[#D4AF37]/50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#5A0808] border border-[#D4AF37]/60 flex items-center justify-center text-[#D4AF37] font-bold text-[11px]">
                        {comment.userName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-bold text-xs text-[#FFF7E8]">{comment.userName}</h5>
                          {isTopRanked && (
                            <span className="inline-flex items-center gap-1 text-[9px] bg-[#D4AF37] text-[#3B0A0A] font-bold px-1.5 py-0.2 rounded">
                              <Trophy className="w-2.5 h-2.5" />
                              Top Reference
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-[#FFF7E8]/50 font-mono">
                          {new Date(comment.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleLike(comment.id)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all ${
                          comment.userLiked
                            ? 'bg-[#5A0808] text-[#FFF7E8] border-[#D4AF37]'
                            : 'bg-[#1A0303]/60 text-[#FFF7E8]/70 border-[#D4AF37]/20 hover:border-[#D4AF37]'
                        }`}
                      >
                        <Heart className={`w-3 h-3 ${comment.userLiked ? 'fill-current text-[#D4AF37]' : ''}`} />
                        <span>{comment.likes}</span>
                      </button>

                      {comment.isCurrentUser && (
                        <button
                          onClick={() => handleDelete(comment.id)}
                          className="p-1 text-red-400 hover:text-red-200"
                          title="Delete reference"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {comment.audioUrl && (
                    <div className="flex items-center gap-3 bg-[#1A0303]/80 border border-[#D4AF37]/30 p-2.5 rounded-lg">
                      <button
                        onClick={() => togglePlayCommentAudio(comment.id, comment.audioUrl)}
                        className="w-8 h-8 rounded-full bg-[#D4AF37] text-[#3B0A0A] flex items-center justify-center font-bold shadow-sm shrink-0"
                      >
                        {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#D4AF37] truncate">
                          <Music2 className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{comment.audioName || 'Audio Reference'}</span>
                        </div>
                        <span className="text-[10px] text-[#FFF7E8]/60">
                          {isPlaying ? 'Playing reference...' : 'Click play to listen'}
                        </span>
                      </div>
                    </div>
                  )}

                  {comment.commentText && (
                    <p className="text-xs text-[#FFF7E8]/80 font-sans leading-relaxed">
                      {comment.commentText}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 bg-[#250505]/40 rounded-xl border border-[#D4AF37]/20 text-[#FFF7E8]/50 text-xs">
            <p>No community audio references yet. Be the first to share one!</p>
          </div>
        )}
      </div>
    </div>
  );
};
