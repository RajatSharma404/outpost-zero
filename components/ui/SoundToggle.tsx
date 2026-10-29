'use client';

import React, { useState, useEffect } from 'react';
import { getAudioMuted, toggleAudio } from '../../lib/sound';
import { Icon } from './Icon';

export const SoundToggle: React.FC = () => {
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    setMuted(getAudioMuted());
  }, []);

  const handleToggle = () => {
    const nextMuted = toggleAudio();
    setMuted(nextMuted);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-pressed={!muted}
      aria-label={muted ? 'Enable telemetry audio synthesis' : 'Disable telemetry audio synthesis'}
      title={muted ? 'Audio Muted — Click to enable synthesis' : 'Audio Active — Click to mute'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-1)',
        backgroundColor: muted ? 'transparent' : 'var(--basalt-2)',
        border: `1px solid ${muted ? 'var(--rule)' : 'var(--ember)'}`,
        borderRadius: 'var(--r-0)',
        padding: '2px var(--space-2)',
        color: muted ? 'var(--ink-dim)' : 'var(--ember)',
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--fs-detail)',
        cursor: 'pointer',
        transition: 'border-color 0.15s ease, color 0.15s ease',
      }}
    >
      <Icon name={muted ? 'pause' : 'play'} size={12} />
      <span>{muted ? 'SOUND OFF' : 'SOUND ON'}</span>
    </button>
  );
};

