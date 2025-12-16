import pauseButton from '@/assets/icons/pause-icon.svg';
import playIcon from '@/assets/icons/play-icon.svg';
import Heading from '@/components/ui/Heading/Heading';
import { ComponentParams, Field, Item, LinkField, Text } from '@sitecore-jss/sitecore-jss-nextjs';
import { default as NextImage } from 'next/image';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactHowler from 'react-howler';
import { BaseComponentFields } from './ArticleDetail.types';

type PlayerState = {
  muted: boolean;
  duration: number;
  playing: boolean;
  played: number;
  playedSeconds: number;
};

export type AudioPlaybackBlockProps = {
  fields: AudioPlaybackBlockFields;
  params?: ComponentParams;
};

interface AudioPlaybackBlockFields extends BaseComponentFields {
  'External Url': LinkField;
  'Sitecore Media Item': LinkField;
  'Media Type': Item & {
    fields: {
      'Control Name': Field<'External' | 'Sitecore'>;
    };
  };
  Title: { value: string };
  Subtitle: { value: string };
}

const AudioProgress = React.memo(function AudioProgress({
  percentage,
  remaining,
  durationFormatted,
}: {
  percentage: number;
  remaining: number;
  durationFormatted: string;
}) {
  return (
    <>
      <div className="progress">
        <span
          className="progress-indicator"
          style={{ transform: `translateX(-${100 - (percentage || 0)}%)` }}
        />
      </div>
      <time dateTime={`P${Math.round(remaining)}S`} aria-live="off" className="duration">
        {durationFormatted}
      </time>
    </>
  );
});

export function AudioPlaybackBlock({ fields, params }: AudioPlaybackBlockProps) {
  const externalUrl = fields?.['External Url']?.value?.href as string | undefined;
  const sitecoreUrl = fields?.['Sitecore Media Item']?.value?.href as string | undefined;

  const src = externalUrl || sitecoreUrl || '';

  const [state, setState] = useState<PlayerState>({
    muted: false,
    duration: 0,
    playing: false,
    played: 0,
    playedSeconds: 0,
  });

  const playerRef = useRef<ReactHowler | null>(null);
  const rafRef = useRef<number | null>(null);

  const { playing, duration, muted, playedSeconds } = state;

  const cancelRAF = () => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const step = useCallback(() => {
    const howl = playerRef.current?.howler;
    if (!howl) return;

    const current = Number(howl.seek()) || 0;
    const dur = Number(howl.duration()) || 0;

    setState((s) => {
      if (Math.floor(current) === Math.floor(s.playedSeconds)) return s;
      return {
        ...s,
        duration: dur,
        playedSeconds: current,
        played: dur ? current / dur : 0,
      };
    });

    if (howl.playing()) {
      rafRef.current = requestAnimationFrame(step);
    } else {
      cancelRAF();
    }
  }, []);

  const handlePlay = useCallback(() => {
    cancelRAF();
    rafRef.current = requestAnimationFrame(step);
    setState((s) => ({ ...s, playing: true }));
  }, [step]);

  const handlePause = useCallback(() => {
    cancelRAF();
    setState((s) => ({ ...s, playing: false }));
  }, []);

  const handleLoad = useCallback(() => {
    const howl = playerRef.current?.howler;
    if (!howl) return;
    const dur = Number(howl.duration()) || 0;
    setState((s) => ({ ...s, duration: dur }));
  }, []);

  const handleEnd = useCallback(() => {
    cancelRAF();
    setState((s) => ({
      ...s,
      playing: false,
      played: 0,
      playedSeconds: 0,
    }));
  }, []);

  const handlePlayPause = useCallback(() => {
    setState((prev) => ({ ...prev, playing: !prev.playing }));
  }, []);

  useEffect(() => {
    cancelRAF();
    setState({
      muted: false,
      duration: 0,
      playing: false,
      played: 0,
      playedSeconds: 0,
    });
  }, [src]);

  useEffect(() => {
    return () => {
      cancelRAF();
    };
  }, []);

  function pad(num: number): string {
    return num.toString().padStart(2, '0');
  }

  function format(seconds: number): string {
    if (!seconds || isNaN(seconds) || seconds < 0) return '00:00';
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = date.getUTCSeconds();
    return hh > 0 ? `${pad(hh)}:${pad(mm)}:${pad(ss)}` : `${pad(mm)}:${pad(ss)}`;
  }

  const remaining = Math.max(0, duration - playedSeconds);
  const durationFormatted = useMemo(() => format(remaining), [remaining]);

  const percentage = useMemo(
    () => (duration > 0 ? (playedSeconds / duration) * 100 : 0),
    [playedSeconds, duration]
  );

  return (
    <div className={`uptick-content-block audio-playback ${params?.styles || ''}`}>
      <div className="text-section">
        <Heading level={3} richText={false} text={fields?.Title} className="title" />
        <Text tag="p" className="subtitle" field={fields.Subtitle} />
      </div>

      <div className="controls">
        <button
          className="play-button"
          aria-label={playing ? 'Pause audio' : 'Play audio'}
          onClick={handlePlayPause}
        >
          {!playing ? (
            <NextImage src={playIcon} alt="Play icon" width={30} height={30} />
          ) : (
            <NextImage src={pauseButton} alt="Pause icon" width={24} height={24} />
          )}
        </button>

        <div className="player">
          <ReactHowler
            key={src}
            ref={playerRef}
            src={src}
            playing={playing}
            mute={muted}
            html5={true}
            preload={true}
            onLoad={handleLoad}
            onPlay={handlePlay}
            onPause={handlePause}
            onEnd={handleEnd}
          />
        </div>

        <AudioProgress
          percentage={percentage}
          remaining={remaining}
          durationFormatted={durationFormatted}
        />
      </div>
    </div>
  );
}
