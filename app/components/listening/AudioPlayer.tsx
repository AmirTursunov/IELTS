"use client";

import React, { useRef, useEffect, useState } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Headphones,
} from "lucide-react";

interface AudioPlayerProps {
  src: string;
  title: string;
}

export function AudioPlayer({ src, title }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const restartAudio = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = 0;
      audio.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = parseFloat(e.target.value);
      setCurrentTime(audio.currentTime);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-md px-4 py-3 mb-4 border border-purple-200">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="p-2 bg-[#9C74FF] rounded-lg">
          <Headphones className="w-4 h-4 text-white" />
        </div>
        <div className="truncate">
          <h3 className="text-sm font-semibold text-gray-900">Audio</h3>
          <p className="text-xs text-gray-500 truncate">{title}</p>
        </div>
      </div>

      <audio ref={audioRef} src={src} onEnded={() => setIsPlaying(false)} />

      {/* Progress */}
      <input
        type="range"
        min="0"
        max={duration || 0}
        value={currentTime}
        onChange={handleSeek}
        className="w-full h-1.5 rounded appearance-none cursor-pointer mb-1"
        style={{
          background: `linear-gradient(to right, #9C74FF 0%, #9C74FF ${
            (currentTime / duration) * 100
          }%, #e5e7eb ${(currentTime / duration) * 100}%)`,
        }}
      />
      <div className="flex justify-between text-[11px] text-gray-500 mb-2">
        <span>{formatTime(Math.floor(currentTime))}</span>
        <span>{formatTime(Math.floor(duration))}</span>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={restartAudio}
            className="p-2 rounded-lg hover:bg-purple-100 text-[#9C74FF]"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={togglePlay}
            className="p-2.5 rounded-lg bg-[#9C74FF] text-white shadow"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-1">
          <button onClick={toggleMute}>
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-gray-500" />
            ) : (
              <Volume2 className="w-4 h-4 text-gray-500" />
            )}
          </button>

          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-16 h-1 rounded cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
