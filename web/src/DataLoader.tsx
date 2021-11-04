import React, { useState, useEffect } from 'react'
import MiniSearch from 'minisearch'
import fetchProgress from 'fetch-progress'
import { MS_CONFIG, NUM_MINISEARCH } from 'bac-shared'

import Loading from './Loading'
import SearchBox from './SearchBox'

export interface DataLoaderProps {
}

const range = function(from: number, to: number) {
    const arr = []
    for(let i = from; i <= to; i++) arr.push(i)
    return arr
};

const DataLoader : React.FunctionComponent<DataLoaderProps> = () => {
  const [minisearches, setMinisearches] = useState<MiniSearch[]>([])
  const [progress, setProgress] = useState<number>()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (loading) return;
    setLoading(true);

    (async () => {
      let totalRequestsSize: number[] = [];
      const requestsTransferredSize = range(0, NUM_MINISEARCH).map(() => 0)
      const updateProgress = () => {
        setProgress(
          requestsTransferredSize.reduce((a, b) => a + b, 0) /
          totalRequestsSize.reduce((a, b) => a + b, 0)
        )
      }

      fetch("/data/index.json")
        .then((res) => res.json())
        .then(async (data: {url: string, size: number}[]) => {
          totalRequestsSize = data.map((x) => x.size)
          setMinisearches(await Promise.all(
            data.map((x, i) => fetch('/data/' + x.url)
              .then(fetchProgress({
                onProgress(progress) {
                  requestsTransferredSize[i] = progress.transferred
                  updateProgress()
                },
                onError(err) {
                  // TODO: handle error
                  console.error(err);
                },
              }))
            .then((res) => res.blob())
            .then(async (blob) => {
              requestsTransferredSize[i] = blob.size
              updateProgress()
              return MiniSearch.loadJSON(await blob.text(), MS_CONFIG)
              })
            )
          ))
        })
    })()
  }, [loading])

  return (
    <>
      {minisearches.length === 0 ? <Loading progress={progress} /> : <SearchBox minisearches={minisearches} />}
    </>
  )
}
export default DataLoader
