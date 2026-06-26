import { useEffect, useMemo, useRef, useState } from 'react';
import { useCourseStore } from '../../store/useCourseStore';
import type { Lesson } from '../../types/course';
import { RotateCcw, RotateCw, ShieldAlert, Captions, Settings, ChevronDown, Play, Maximize2, PictureInPicture2 } from 'lucide-react';
import api from '../../lib/axios';

interface VideoPlayerProps {
  lesson: Lesson;
}

export function VideoPlayer({ lesson }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const markLessonComplete = useCourseStore((state) => state.markLessonComplete);
  const setCompletedLessons = useCourseStore((state) => state.setCompletedLessons);
  const setCourseProgress = useCourseStore((state) => state.setCourseProgress);
  const completedLessons = useCourseStore((state) => state.completedLessons);
  const course = useCourseStore((state) => state.course);
  const setActiveLesson = useCourseStore((state) => state.setActiveLesson);
  const [completed, setCompleted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [antiCaptureMsg, setAntiCaptureMsg] = useState('');
  const [controlsVisible, setControlsVisible] = useState(true);
  const [qualityOpen, setQualityOpen] = useState(false);
  const [captionsOpen, setCaptionsOpen] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState<string>('auto');
  const [selectedSource, setSelectedSource] = useState<string>(lesson.video?.url || '');
  const [selectedCaption, setSelectedCaption] = useState<string>('');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [nextLessonCountdown, setNextLessonCountdown] = useState<number | null>(null);
  const [nextLessonTitle, setNextLessonTitle] = useState('');
  const hideControlsTimer = useRef<number | null>(null);
  const nextLessonTimer = useRef<number | null>(null);
  const countdownTimer = useRef<number | null>(null);

  const qualities = useMemo(() => {
    const items = lesson.video?.qualities && lesson.video.qualities.length > 0
      ? lesson.video.qualities
      : [{ label: 'Auto', url: lesson.video?.url || '' }];
    return items;
  }, [lesson.video]);

  useEffect(() => {
    setCompleted(false);
    setPlaying(false);
    setAntiCaptureMsg('');
    setControlsVisible(true);
    setQualityOpen(false);
    setCaptionsOpen(false);
    setSelectedQuality('auto');
    setSelectedSource(lesson.video?.url || '');
    setSelectedCaption('');
    setCurrentTime(0);
    setDuration(0);
  }, [lesson.id]);

  useEffect(() => {
    return () => {
      if (hideControlsTimer.current) {
        window.clearTimeout(hideControlsTimer.current);
      }
      if (nextLessonTimer.current) {
        window.clearTimeout(nextLessonTimer.current);
      }
      if (countdownTimer.current) {
        window.clearInterval(countdownTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.hidden) {
        setAntiCaptureMsg('La pantalla se ocultó. El video se pausó por seguridad.');
        videoRef.current?.pause();
        setPlaying(false);
      }
    };

    const onBlur = () => {
      setAntiCaptureMsg('Se detectó cambio de foco. El video se pausó por seguridad.');
      videoRef.current?.pause();
      setPlaying(false);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen' || (e.ctrlKey && e.shiftKey && ['S', 'I', 'J', 'C'].includes(e.key.toUpperCase()))) {
        setAntiCaptureMsg('Acción bloqueada durante reproducción.');
        e.preventDefault();
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('blur', onBlur);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const syncProgress = async (percentage: number, isCompleted = false) => {
    try {
      const response = await api.post(`/lessons/${lesson.id}/progress`, { percentage, isCompleted });
      if (typeof response.data?.courseProgress === 'number') {
        setCourseProgress(response.data.courseProgress);
        window.dispatchEvent(
          new CustomEvent('course-progress-updated', {
            detail: { courseProgress: response.data.courseProgress },
          })
        );
      }
    } catch (error) {
      console.error('No se pudo guardar el progreso de la lección', error);
    }
  };

  const scheduleControlsHide = () => {
    if (hideControlsTimer.current) {
      window.clearTimeout(hideControlsTimer.current);
    }
    hideControlsTimer.current = window.setTimeout(() => {
      if (playing) setControlsVisible(false);
    }, 2400);
  };

  const showControls = () => {
    setControlsVisible(true);
    scheduleControlsHide();
  };

  const handleQualityChange = (label: string, url: string) => {
    const current = videoRef.current?.currentTime ?? 0;
    const wasPlaying = playing;
    setSelectedQuality(label.toLowerCase());
    setQualityOpen(false);
    setSelectedSource(url);
    window.setTimeout(() => {
      if (!videoRef.current) return;
      videoRef.current.currentTime = current;
      if (wasPlaying) {
        videoRef.current.play().catch(() => {});
      }
    }, 0);
  };

  const toggleCaptions = (label: string) => {
    const video = videoRef.current;
    if (!video) return;
    const tracks = video.textTracks;
    for (let i = 0; i < tracks.length; i += 1) {
      tracks[i].mode = label && tracks[i].label === label ? 'showing' : 'disabled';
    }
    setSelectedCaption(label);
    setCaptionsOpen(false);
  };

  const handleSeek = (nextTime: number) => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(nextTime)) return;
    video.currentTime = Math.max(0, Math.min(video.duration || 0, nextTime));
    setCurrentTime(video.currentTime);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const { currentTime: time, duration: totalDuration } = videoRef.current;
    setCurrentTime(time);
    setDuration(totalDuration || 0);

    if (totalDuration > 0) {
      const percentage = Math.min(100, Math.round((time / totalDuration) * 100));
      if (percentage > 0 && percentage < 100) {
        syncProgress(percentage, false);
      }
      if (!completed && percentage >= 90) {
        markLessonComplete(lesson.id);
        setCompleted(true);
        setCompletedLessons(Array.from(new Set([...completedLessons, lesson.id])));
        syncProgress(100, true);
      }
    }
  };

  const seekBy = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    handleSeek(video.currentTime + seconds);
  };

  const scheduleNextLesson = () => {
    if (!course) return;

    const flattenedLessons = course.modules
      .slice()
      .sort((a, b) => a.order - b.order)
      .flatMap((module) => module.lessons.slice().sort((a, b) => a.order - b.order));

    const currentIndex = flattenedLessons.findIndex((currentLesson) => currentLesson.id === lesson.id);
    const nextLesson = currentIndex >= 0 ? flattenedLessons[currentIndex + 1] : null;

    if (!nextLesson) return;

    if (nextLessonTimer.current) {
      window.clearTimeout(nextLessonTimer.current);
    }
    if (countdownTimer.current) {
      window.clearInterval(countdownTimer.current);
    }

    setNextLessonTitle(nextLesson.title);
    setNextLessonCountdown(10);

    countdownTimer.current = window.setInterval(() => {
      setNextLessonCountdown((value) => {
        if (value === null || value <= 1) {
          if (countdownTimer.current) {
            window.clearInterval(countdownTimer.current);
            countdownTimer.current = null;
          }
          setActiveLesson(nextLesson.id);
          setNextLessonTitle('');
          return null;
        }

        return value - 1;
      });
    }, 1000);
  };

  const toggleFullscreen = async () => {
    const container = playerRef.current;
    if (!container) return;

    if (document.fullscreenElement) {
      await document.exitFullscreen().catch(() => {});
      return;
    }

    await container.requestFullscreen?.().catch(() => {});
  };

  const togglePictureInPicture = async () => {
    const video = videoRef.current as HTMLVideoElement & { webkitSetPresentationMode?: (mode: string) => void };
    if (!video) return;

    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture().catch(() => {});
      return;
    }

    if (document.pictureInPictureEnabled && video.requestPictureInPicture) {
      await video.requestPictureInPicture().catch(() => {});
      return;
    }

    video.webkitSetPresentationMode?.('picture-in-picture');
  };

  if (!lesson.video?.url) {
    return (
      <div className="w-full bg-black aspect-video rounded-xl overflow-hidden relative shadow-lg flex items-center justify-center text-white">
        <p>El video no está disponible.</p>
      </div>
    );
  }

  return (
    <div ref={playerRef} className="w-full bg-black aspect-video rounded-xl overflow-hidden relative shadow-lg group">
      <video
        ref={videoRef}
        key={lesson.id}
        src={selectedSource || lesson.video.url}
        controls={false}
        className="w-full h-full object-contain select-none"
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => {
          setPlaying(true);
          showControls();
        }}
        onPause={() => {
          setPlaying(false);
          setControlsVisible(true);
        }}
        onEnded={() => {
          markLessonComplete(lesson.id);
          setCompleted(true);
          setCompletedLessons(Array.from(new Set([...completedLessons, lesson.id])));
          syncProgress(100, true);
          scheduleNextLesson();
        }}
        onMouseMove={showControls}
        onMouseEnter={() => {
          setControlsVisible(true);
          if (hideControlsTimer.current) window.clearTimeout(hideControlsTimer.current);
        }}
        onMouseLeave={() => {
          if (playing) scheduleControlsHide();
          else setControlsVisible(true);
        }}
        onContextMenu={(e) => e.preventDefault()}
        onLoadedMetadata={() => syncProgress(0, false)}
        autoPlay
        muted={muted}
        controlsList="nodownload noplaybackrate noremoteplayback"
      >
        {lesson.video?.captions?.map((track) => (
          <track
            key={`${track.label}-${track.src}`}
            kind="subtitles"
            srcLang={track.lang || track.label.toLowerCase()}
            label={track.label}
            src={track.src}
            default={track.default}
          />
        ))}
      </video>
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.2)_100%)]" />
      <div className={`absolute top-3 left-3 right-3 flex items-start justify-between gap-2 transition-opacity duration-300 ${controlsVisible ? 'opacity-100' : 'opacity-0'}`}>
        <div className="rounded-full bg-black/45 border border-white/10 px-3 py-1 text-[10px] sm:text-xs text-white/70 backdrop-blur-sm">
          {lesson.title}
        </div>
        {antiCaptureMsg && (
          <div className="rounded-full bg-red-500/20 border border-red-400/30 px-3 py-1 text-[10px] sm:text-xs text-red-100 backdrop-blur-sm pointer-events-auto">
            <ShieldAlert className="inline h-3 w-3 mr-1" />
            {antiCaptureMsg}
          </div>
        )}
      </div>
      <div className={`absolute inset-x-0 bottom-0 p-3 sm:p-4 transition-opacity duration-300 ${controlsVisible ? 'opacity-100' : 'opacity-0'}`}>
        <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-black/65 backdrop-blur-md px-3 py-2 sm:px-4 sm:py-3 space-y-2 pointer-events-auto">
          <div className="space-y-1">
            <input
              type="range"
              min={0}
              max={Math.max(duration, 0)}
              step="0.1"
              value={Math.min(currentTime, duration || 0)}
              onChange={(e) => handleSeek(Number(e.target.value))}
              aria-label="Línea de tiempo del video"
              className="w-full h-1.5 cursor-pointer appearance-none rounded-full bg-white/20 accent-primary"
            />
            <div className="flex items-center justify-between text-[10px] sm:text-xs text-white/70 font-medium">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <button type="button" onClick={() => seekBy(-10)} className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2.5 py-1.5 text-[11px] text-white hover:bg-white/15" aria-label="Retroceder 10 segundos">
                <RotateCcw className="h-3.5 w-3.5" /> <span>10 s</span>
              </button>
              <button type="button" onClick={() => (playing ? videoRef.current?.pause() : videoRef.current?.play())} className="inline-flex items-center gap-2 rounded-md bg-primary px-2.5 py-1.5 text-[11px] font-semibold text-primary-foreground hover:bg-primary/90">
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-current/60 text-[9px] leading-none">
                  {playing ? 'II' : '▶'}
                </span>
                {playing ? 'Pausar' : 'Reproducir'}
              </button>
              <button type="button" onClick={() => seekBy(10)} className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2.5 py-1.5 text-[11px] text-white hover:bg-white/15" aria-label="Avanzar 10 segundos">
                <span>10 s</span> <RotateCw className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={togglePictureInPicture}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-white/10 text-white hover:bg-white/15"
                aria-label="Imagen en imagen"
              >
                <PictureInPicture2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={toggleFullscreen}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-white/10 text-white hover:bg-white/15"
                aria-label="Pantalla completa"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <button type="button" onClick={() => setQualityOpen((v) => !v)} className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2.5 py-1.5 text-[11px] text-white hover:bg-white/15">
                  <Settings className="h-4 w-4" />
                  {selectedQuality === 'auto' ? 'Calidad' : selectedQuality.toUpperCase()}
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                {qualityOpen && (
                  <div className="absolute bottom-full mb-2 right-0 min-w-36 rounded-xl border border-white/10 bg-black/90 p-1 shadow-xl">
                    {qualities.map((quality) => (
                      <button
                        key={quality.label}
                        type="button"
                        onClick={() => handleQualityChange(quality.label, quality.url)}
                        className="w-full rounded-lg px-3 py-2 text-left text-xs text-white hover:bg-white/10"
                      >
                        {quality.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative">
                <button type="button" onClick={() => setCaptionsOpen((v) => !v)} className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2.5 py-1.5 text-[11px] text-white hover:bg-white/15">
                  <Captions className="h-4 w-4" />
                  Subtítulos
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                {captionsOpen && (
                  <div className="absolute bottom-full mb-2 right-0 min-w-40 rounded-xl border border-white/10 bg-black/90 p-1 shadow-xl">
                    <button type="button" onClick={() => toggleCaptions('')} className="w-full rounded-lg px-3 py-2 text-left text-xs text-white hover:bg-white/10">
                      Desactivados
                    </button>
                    {lesson.video?.captions?.map((track) => (
                      <button
                        key={track.label}
                        type="button"
                        onClick={() => toggleCaptions(track.label)}
                        className="w-full rounded-lg px-3 py-2 text-left text-xs text-white hover:bg-white/10"
                      >
                        {track.label}{selectedCaption === track.label ? ' ✓' : ''}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  const next = !muted;
                  setMuted(next);
                  if (videoRef.current) videoRef.current.muted = next;
                }}
                className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2.5 py-1.5 text-[11px] text-white hover:bg-white/15"
                aria-label={muted ? 'Activar audio' : 'Silenciar audio'}
              >
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-current/60 text-[9px] leading-none">
                  {muted ? 'M' : 'A'}
                </span>
                <span>{muted ? 'Silencio' : 'Audio'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      {nextLessonCountdown !== null && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/35 backdrop-blur-[2px] pointer-events-none">
          <div className="flex flex-col items-center gap-4 rounded-[28px] border border-white/10 bg-black/70 px-8 py-7 shadow-2xl">
            <div className="relative h-28 w-28">
              <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
                <circle cx="60" cy="60" r="52" className="fill-none stroke-white/10" strokeWidth="8" />
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  className="fill-none stroke-primary transition-all duration-300"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 52}`}
                  strokeDashoffset={`${2 * Math.PI * 52 * (1 - nextLessonCountdown / 10)}`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <div className="mb-1 inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <Play className="h-5 w-5 fill-current" />
                </div>
                <div className="text-3xl font-black text-white">{nextLessonCountdown}</div>
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.35em] text-white/60">Siguiente video</p>
              <p className="mt-2 max-w-[260px] text-sm font-semibold text-white">{nextLessonTitle}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const totalSeconds = Math.floor(seconds);
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}
