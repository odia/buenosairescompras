import React, { useState, useEffect } from 'react'

import Loading from './Loading'
import SearchBox from './SearchBox'
// eslint-disable-next-line import/no-webpack-loader-syntax
import worker from 'workerize-loader!./worker'

export interface DataLoaderProps {
}

const DataLoader : React.FunctionComponent<DataLoaderProps> = () => {
  const [progress, setProgress] = useState<number>()
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)
  const [ready, setReady] = useState(false)
  const [workerInstance, setWorkerInstance] = useState(null)
  const [searchResults, setSearchResults] = useState([])

  const retry = () => {
    setMinisearches([])
    setProgress(0)
    setFailed(false)
    setLoading(false)
    setReady(false)
  }

  useEffect(() => {
    if (workerInstance) return
    const w = worker()
    setWorkerInstance(w)

    w.addEventListener("message", ({ data }) => {
      // I don't know why `const [t, params] = data` does not work
      const [t, params] = [data[0], data[1]]
      if (!t) return
      switch (t) {
        case 'setFailed': setFailed(params); break
        case 'setProgress': setProgress(params); break
        case 'setReady': setReady(params); break
        case 'setSearchResults': setSearchResults(params); break
        default: console.error('unexpected message type: ' + t); break
      }
    })
  }, [workerInstance])

  const setCriteria = (criteria: string) => {
    workerInstance.search(criteria)
  }

  useEffect(() => {
    if (loading || !workerInstance) return;
    setLoading(true);

    workerInstance.init()
  }, [loading, workerInstance])

  return (
    <>
      {failed ?
        (
          <p>
            Falló la descarga
            <button onClick={() => retry()}>Reintentar</button>
          </p>
        ) :
        (!ready ? <Loading text={progress === 1 ? 'Preparing...' : 'Downloading...'} progress={progress} /> : <SearchBox searchResults={searchResults} search={setCriteria} />)
      }
    </>
  )
}
export default DataLoader
