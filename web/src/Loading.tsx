import React from 'react';

function Loading({ text, progress }: { text: string | undefined, progress: number | undefined }) {
  return (
    <p>
      {text || 'Loading...'}
      <br />
      {progress !== undefined && <input type="range" value={progress * 1000} readOnly name="volume" min="0" max="1000" step="1" />}
      {progress === undefined && 'unknown length'}
    </p>
  )
}

export default Loading;
