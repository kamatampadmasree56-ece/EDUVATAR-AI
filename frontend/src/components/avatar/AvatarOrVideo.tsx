import React, { useState } from 'react';
import { useTeachingStore } from '../../store/useTeachingStore';
import { TeacherAvatar } from './TeacherAvatar';

interface AvatarOrVideoProps {
  className?: string;
}

export const AvatarOrVideo: React.FC<AvatarOrVideoProps> = ({ className = '' }) => {
  const { lesson, currentSectionIndex } = useTeachingStore();
  const [videoFailed, setVideoFailed] = useState(false);

  // Try multiple possible locations where a video_url might be stored
  const topVideo = (lesson as any)?.video_url || (lesson as any)?.videoUrl || null;
  const sectionVideo = (lesson as any)?.sections?.[currentSectionIndex]?.visual_data?.video_url || null;
  const visualDataVideo = (lesson as any)?.sections?.[currentSectionIndex]?.visual_data?.video || null;

  const videoUrl: string | null = topVideo || sectionVideo || visualDataVideo || null;

  if (videoUrl && !videoFailed) {
    // Render a native video element only when a valid non-empty URL is present
    return (
      <div className={`relative ${className}`}>
        <video
          src={videoUrl}
          controls
          playsInline
          onError={() => setVideoFailed(true)}
          className="w-48 h-48 rounded-2xl bg-black object-cover"
        />
      </div>
    );
  }

  // Fallback to interactive SVG avatar
  return <TeacherAvatar className={className} />;
};

export default AvatarOrVideo;
