import React, { useState } from 'react';

import DataLoader from './DataLoader'

function App() {
  const [ready, setReady] = useState(false)
  return (
    <>
      {!ready && <button onClick={() => setReady(true)}>Listo para descargar muchos megas de datos</button>}
      {ready && <DataLoader />}
    </>
  );
}

export default App;
