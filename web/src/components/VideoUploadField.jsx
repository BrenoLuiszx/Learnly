import React from 'react';
import { getYouTubeId } from '../utils/format';

export const isVideoUpload = () => false;

const VideoUploadField = ({ url, onChange, stopProp = false }) => {
  const stop = (e) => { if (stopProp) e.stopPropagation(); };
  const youtubeId = getYouTubeId(url);

  return (
    <div>
      <input
        type="text"
        placeholder="https://youtube.com/watch?v=..."
        value={url || ''}
        onChange={e => { stop(e); onChange(e.target.value); }}
        onClick={stop}
        style={{ width: '100%', padding: '10px 12px', background: '#0a0a0b', border: '1px solid #3a3a3c', borderRadius: '8px', color: '#f2f2f7', fontSize: '0.9rem', fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none' }}
        onFocus={e => e.target.style.borderColor = '#ffd700'}
        onBlur={e => e.target.style.borderColor = '#3a3a3c'}
      />
      {url && youtubeId && <p style={{ color: '#34d399', fontSize: '0.72rem', margin: '4px 0 0' }}>✓ URL do YouTube reconhecida</p>}
      {url && !youtubeId && <p style={{ color: '#fbbf24', fontSize: '0.72rem', margin: '4px 0 0' }}>ℹ URL não reconhecida como YouTube</p>}
    </div>
  );
};

export default VideoUploadField;
