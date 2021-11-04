import React, { useState, useEffect } from 'react'
import MiniSearch from 'minisearch'

import Loading from './Loading'
import SearchBox from './SearchBox'
import { MS_CONFIG } from 'bac-shared'
// eslint-disable-next-line import/no-webpack-loader-syntax
import worker from 'workerize-loader!./worker'

export interface DataLoaderProps {
}

const DataLoader : React.FunctionComponent<DataLoaderProps> = () => {
  const [minisearches, setMinisearches] = useState<MiniSearch[]>([])
  const [progress, setProgress] = useState<number>()
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)

  const retry = () => {
    setMinisearches([])
    setProgress(0)
    setFailed(false)
    setLoading(false)
  }

  useEffect(() => {
    if (loading) return;
    setLoading(true);

    let instance = worker()
    instance.addEventListener("message", ({ data }) => {
      // I don't know why `const [t, params] = data` does not work
      const [t, params] = [data[0], data[1]]
      if (!t) return
      switch (t) {
        case 'setFailed': setFailed(params); break
        case 'setProgress': setProgress(params); break
        default: console.error('unexpected message type: ' + t); break
      }
    })
     
    instance.getMiniSearchJSON().then((json) => {
      setMinisearches(json.map((j) => MiniSearch.loadJS(j, MS_CONFIG)))
    })
  }, [loading])

  return (
    <>
      {failed ?
        (
          <p>
            Falló la descarga
            <button onClick={() => retry()}>Reintentar</button>
          </p>
        ) :
        (minisearches.length === 0 ? <Loading text={progress === 1 ? 'Preparing...' : 'Downloading...'} progress={progress} /> : <SearchBox minisearches={minisearches} />)
      }
    </>
  )
}
export default DataLoader
