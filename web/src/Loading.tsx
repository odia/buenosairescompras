import React from 'react';

function Loading({ progress }: { progress: number | undefined }) {
  return (
    <p>
      Loading...
      <br />
      {progress !== undefined && <input type="range" value={progress * 1000} readOnly name="volume" min="0" max="1000" step="1" />}
    </p>
  )
}

export default Loading;
