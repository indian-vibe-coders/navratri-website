import { useState, useEffect, useRef } from 'react';
import {
  saveUserAudioRecord,
  getUserAudioRecord,
  deleteUserAudioRecord,
} from '../utils/userAudioStorage';

export interface UserAudioState {
  hasAudio: boolean;
  audioUrl: string | null;
  fileName: string | null;
  duration: string;
  isRecording: boolean;
  recordingTime: number;
  isLoading: boolean;
  error: string | null;
}

export const useUserAudio = (garbaId: string) => {
  const [audioState, setAudioState] = useState<UserAudioState>({
    hasAudio: false,
    audioUrl: null,
    fileName: null,
    duration: '00:00',
    isRecording: false,
    recordingTime: 0,
    isLoading: true,
    error: null,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load existing audio record on mount or when garbaId changes
  useEffect(() => {
    let active = true;

    const loadAudio = async () => {
      try {
        setAudioState((prev) => ({ ...prev, isLoading: true, error: null }));
        const record = await getUserAudioRecord(garbaId);

        if (active && record && record.blob) {
          const url = URL.createObjectURL(record.blob);
          setAudioState({
            hasAudio: true,
            audioUrl: url,
            fileName: record.fileName || 'Voice Reference',
            duration: record.duration || '00:00',
            isRecording: false,
            recordingTime: 0,
            isLoading: false,
            error: null,
          });
        } else if (active) {
          setAudioState({
            hasAudio: false,
            audioUrl: null,
            fileName: null,
            duration: '00:00',
            isRecording: false,
            recordingTime: 0,
            isLoading: false,
            error: null,
          });
        }
      } catch (err) {
        if (active) {
          setAudioState((prev) => ({
            ...prev,
            isLoading: false,
            error: 'Failed to load audio reference.',
          }));
        }
      }
    };

    loadAudio();

    return () => {
      active = false;
      if (audioState.audioUrl) {
        URL.revokeObjectURL(audioState.audioUrl);
      }
    };
  }, [garbaId]);

  // Start live voice recording via microphone
  const startRecording = async (customName?: string) => {
    try {
      setAudioState((prev) => ({ ...prev, error: null }));
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const formatTime = (seconds: number) => {
          const m = Math.floor(seconds / 60);
          const s = seconds % 60;
          return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
        };
        const durationStr = formatTime(audioState.recordingTime);
        const recordingTitle = customName?.trim() || 'Microphone Voice Recording';

        await saveUserAudioRecord(garbaId, audioBlob, recordingTitle, durationStr);

        const newUrl = URL.createObjectURL(audioBlob);
        setAudioState((prev) => ({
          ...prev,
          hasAudio: true,
          audioUrl: newUrl,
          fileName: recordingTitle,
          duration: durationStr,
          isRecording: false,
          recordingTime: 0,
        }));

        // Stop all track streams
        stream.getTracks().forEach((track) => track.stop());
      };


      mediaRecorder.start();

      // Start recording timer
      setAudioState((prev) => ({ ...prev, isRecording: true, recordingTime: 0 }));
      timerRef.current = setInterval(() => {
        setAudioState((prev) => ({ ...prev, recordingTime: prev.recordingTime + 1 }));
      }, 1000);
    } catch (err) {
      setAudioState((prev) => ({
        ...prev,
        error: 'Microphone permission denied or not available.',
        isRecording: false,
      }));
    }
  };

  // Stop live recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Upload custom audio file from device
  const uploadAudioFile = async (file: File, customName?: string) => {
    try {
      setAudioState((prev) => ({ ...prev, isLoading: true, error: null }));

      // Calculate audio duration
      const tempUrl = URL.createObjectURL(file);
      const tempAudio = new Audio(tempUrl);

      tempAudio.onloadedmetadata = async () => {
        const totalSeconds = Math.floor(tempAudio.duration || 0);
        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        const durationStr = `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
        const displayName = customName?.trim() ? `${customName.trim()} - ${file.name}` : file.name;

        await saveUserAudioRecord(garbaId, file, displayName, durationStr);

        setAudioState({
          hasAudio: true,
          audioUrl: tempUrl,
          fileName: displayName,
          duration: durationStr,
          isRecording: false,
          recordingTime: 0,
          isLoading: false,
          error: null,
        });
      };

    } catch (err) {
      setAudioState((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Failed to upload audio file.',
      }));
    }
  };

  // Remove / delete custom audio
  const removeAudio = async () => {
    try {
      await deleteUserAudioRecord(garbaId);
      if (audioState.audioUrl) {
        URL.revokeObjectURL(audioState.audioUrl);
      }
      setAudioState({
        hasAudio: false,
        audioUrl: null,
        fileName: null,
        duration: '00:00',
        isRecording: false,
        recordingTime: 0,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      setAudioState((prev) => ({ ...prev, error: 'Failed to delete audio reference.' }));
    }
  };

  return {
    audioState,
    startRecording,
    stopRecording,
    uploadAudioFile,
    removeAudio,
  };
};
