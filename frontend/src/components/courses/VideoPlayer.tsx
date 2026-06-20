import { useEffect, useRef, useState } from 'react';
import { useCourseStore } from '../../store/useCourseStore';
import type { Lesson } from '../../types/course';

interface VideoPlayerProps {
  lesson: Lesson;
}

export function VideoPlayer({ lesson }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const markLessonComplete = useCourseStore((state) => state.markLessonComplete);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    setCompleted(false);
  }, [lesson.id]);

  const handleTimeUpdate = () => {
    if (!completed && videoRef.current) {
      const { currentTime, duration } = videoRef.current;
      if (duration > 0 && currentTime / duration >= 0.9) {
        markLessonComplete(lesson.id);
        setCompleted(true);
      }
    }
  };

  if (!lesson.video?.url) {
    return (
      <div className="w-full bg-black aspect-video rounded-xl overflow-hidden relative shadow-lg flex items-center justify-center text-white">
        <p>El video no está disponible.</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-black aspect-video rounded-xl overflow-hidden relative shadow-lg">
      <video
        ref={videoRef}
        key={lesson.id}
        src={lesson.video.url}
        controls
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        autoPlay
      />
    </div>
  );
}
