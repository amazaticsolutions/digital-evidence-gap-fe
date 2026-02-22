/**
 * VideoPlayer — native HTML5 video player with optional clip windowing.
 *
 * Basic usage:
 *   <VideoPlayer src="https://example.com/footage.mp4" />
 *
 * With title and poster thumbnail:
 *   <VideoPlayer
 *     src="https://example.com/footage.mp4"
 *     title="CAM-04 — 2024-02-21 10:32:00"
 *     poster="https://example.com/thumbnail.jpg"
 *   />
 *
 * With a clip window from the API (startTime and endTime in seconds):
 *   <VideoPlayer
 *     src="https://example.com/footage.mp4"
 *     title="Suspect identified — CAM-04"
 *     startTime={65}   // 1 min 5 sec — seeks here on load and after clip ends
 *     endTime={95}     // 1 min 35 sec — playback stops and resets here
 *   />
 *
 * startTime only — plays from that point, no forced stop:
 *   <VideoPlayer src="..." startTime={120} />
 *
 * endTime only — plays from the beginning, stops at cut-off:
 *   <VideoPlayer src="..." endTime={30} />
 *
 * Mapping from an API response (null-safe):
 *   <VideoPlayer
 *     src={evidence.file_path}
 *     title={evidence.filename}
 *     startTime={evidence.start_time ?? undefined}
 *     endTime={evidence.end_time ?? undefined}
 *   />
 */
import { useRef, useState, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
} from "lucide-react";
import * as Slider from "@radix-ui/react-slider";

interface VideoPlayerProps {
  src: string;
  title?: string;
  poster?: string;
  /** Optional clip start time in seconds (from API). Video seeks here on load and on replay. */
  startTime?: number;
  /** Optional clip end time in seconds (from API). Video pauses and resets when reached. */
  endTime?: number;
}

export function VideoPlayer({
  src,
  title,
  poster,
  startTime,
  endTime,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const clipStart = startTime ?? 0;
  const clipEnd = endTime ?? duration;
  const clipDuration = Math.max(0, clipEnd - clipStart);

  // Clamp progress percentage within the clip range [0, 100]
  const clipProgress =
    clipDuration > 0
      ? Math.min(100, Math.max(0, ((currentTime - clipStart) / clipDuration) * 100))
      : 0;

  const formatTime = (seconds: number) => {
    const s = Math.max(0, seconds);
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  // Seek to clipStart when video metadata is available
  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
    if (startTime !== undefined) {
      videoRef.current.currentTime = startTime;
      setCurrentTime(startTime);
    }
  };

  // Stop playback when endTime is reached, reset to clipStart
  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;
    const time = videoRef.current.currentTime;
    setCurrentTime(time);

    if (endTime !== undefined && time >= endTime) {
      videoRef.current.pause();
      videoRef.current.currentTime = clipStart;
      setCurrentTime(clipStart);
      setIsPlaying(false);
    }
  }, [clipStart, endTime]);

  const togglePlay = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      // Restart from clipStart if at/past end or before start
      const time = videoRef.current.currentTime;
      if (
        (endTime !== undefined && time >= endTime) ||
        time < clipStart
      ) {
        videoRef.current.currentTime = clipStart;
        setCurrentTime(clipStart);
      }
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  // Slider seek — value is absolute seconds within [clipStart, clipEnd]
  const handleSeek = (values: number[]) => {
    const time = values[0];
    if (!videoRef.current) return;
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Sync fullscreen state if user exits via keyboard (Escape)
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  // Reset player state when src changes
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(startTime ?? 0);
    setDuration(0);
  }, [src, startTime]);

  return (
    <div
      ref={containerRef}
      className="w-full bg-black rounded-xl overflow-hidden"
    >
      {title && (
        <div className="bg-gray-900 px-4 py-3 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-sm font-medium text-white truncate">{title}</h3>
          {(startTime !== undefined || endTime !== undefined) && (
            <span className="ml-3 shrink-0 text-xs font-mono text-gray-400 bg-gray-800 px-2 py-0.5 rounded">
              {formatTime(clipStart)} – {clipEnd > 0 ? formatTime(clipEnd) : "--:--"}
            </span>
          )}
        </div>
      )}

      <div className="relative group">
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          className="w-full h-auto max-h-[70vh] object-contain cursor-pointer"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
          onClick={togglePlay}
        />

        {/* Play overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          onClick={togglePlay}
        >
          {!isPlaying && (
            <div className="bg-black/70 rounded-full p-6">
              <Play
                className="w-12 h-12 text-white"
                strokeWidth={2}
                fill="white"
              />
            </div>
          )}
        </div>

        {/* Controls bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">

          {/* Seek slider (Radix UI) — scoped to [clipStart, clipEnd] */}
          <Slider.Root
            className="relative flex items-center select-none touch-none w-full mb-4 h-4 cursor-pointer"
            min={clipStart}
            max={clipEnd > clipStart ? clipEnd : clipStart + 0.001}
            step={0.1}
            value={[Math.min(Math.max(currentTime, clipStart), clipEnd)]}
            onValueChange={handleSeek}
          >
            <Slider.Track className="relative bg-gray-600 rounded-full h-1 flex-1">
              <Slider.Range
                className="absolute h-full rounded-full bg-white"
                style={{ width: `${clipProgress}%` }}
              />
            </Slider.Track>
            <Slider.Thumb
              className="block w-3 h-3 bg-white rounded-full shadow-md hover:scale-125 focus:outline-none focus:ring-2 focus:ring-white transition-transform"
              aria-label="Seek"
            />
          </Slider.Root>

          {/* Buttons + time */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 text-white" strokeWidth={2} />
                ) : (
                  <Play className="w-5 h-5 text-white" strokeWidth={2} />
                )}
              </button>

              <button
                onClick={toggleMute}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5 text-white" strokeWidth={2} />
                ) : (
                  <Volume2 className="w-5 h-5 text-white" strokeWidth={2} />
                )}
              </button>

              {/* Shows time elapsed within clip / total clip duration */}
              <div className="text-sm text-white font-medium font-mono">
                {formatTime(currentTime - clipStart)}&thinsp;/&thinsp;
                {formatTime(clipDuration > 0 ? clipDuration : duration)}
              </div>
            </div>

            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
            >
              {isFullscreen ? (
                <Minimize className="w-5 h-5 text-white" strokeWidth={2} />
              ) : (
                <Maximize className="w-5 h-5 text-white" strokeWidth={2} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
