import React, { useState } from 'react'
import MiniSearch from 'minisearch'
import fetchProgress from 'fetch-progress'

import Loading from './Loading'
import SearchBox from './SearchBox'

export interface DataLoaderProps {
}

// FIXME: shared with create-index
const NUM_MINISEARCH = 10
const COLS = [
  'tender/title',
  'tender/description',
  'tender/status',
  'tender/value/currency',
  'tender/value/amount',
  'tender/procuringEntity/name',
  'tender/procurementMethodDetails',
  'tender/mainProcurementCategory',
  'tender/tenderPeriod/startDate',
  'tender/tenderPeriod/endDate',
  'tender/tenderPeriod/durationInDays',
  'tender/enquiryPeriod/startDate',
  'tender/enquiryPeriod/endDate',
  'tender/enquiryPeriod/durationInDays',
  'tender/documents/0/url',
]
const MS_CONFIG = {
  fields: ['content'],
  storeFields: COLS.concat(['compressed']),
}

const range = function(from: number, to: number) {
    const arr = []
    for(let i = from; i <= to; i++) arr.push(i)
    return arr
};

const DataLoader : React.FunctionComponent<DataLoaderProps> = () => {
  const [minisearches, setMinisearches] = useState<MiniSearch[]>([])
  const [progress, setProgress] = useState<number>()

  useState(() => {
    (async () => {
      const totalRequestsSize = range(0, NUM_MINISEARCH).map(() => 0)
      const requestsTransferredSize = range(0, NUM_MINISEARCH).map(() => 0)
      const updateProgress = () => {
        if (totalRequestsSize.some((x) => x === 0)) return
        setProgress(
          requestsTransferredSize.reduce((a, b) => a + b, 0) /
          totalRequestsSize.reduce((a, b) => a + b, 0)
        )
      }
      setMinisearches(await Promise.all(range(0, NUM_MINISEARCH)
        // TODO: save to localStorage
        .map((i) => {
          let headers = new Headers();
          // appending range header to get number of bytes
          // since chunked transfer encoding does not return content length
          headers.append("Range", "bytes=0-" + (100 * 1024 * 1024));
          let request = new Request(`/data/index${i}.json`, {headers:headers});
          return fetch(request)
            .then((r) => {
              const range = r.headers.get('content-range')
              let reqSize = 0;
              if (range && range.includes('/')) {
                reqSize = parseInt(range.split('/')[1])
                totalRequestsSize[i] = reqSize
                updateProgress()
              }
              return fetchProgress({
                onProgress(progress) {
                  requestsTransferredSize[i] = progress.transferred
                  updateProgress()
                },
                onError(err) {
                  // TODO: handle error
                  console.error(err);
                },
              })(r)
            })
            .then((res) => res.blob())
            .then(async (blob) => {
              requestsTransferredSize[i] = blob.size
              updateProgress()
              return MiniSearch.loadJSON(await blob.text(), MS_CONFIG)
            })
            // TODO: handle error
          })
        )
      )
    })()
  })

  return (
    <>
      {minisearches.length === 0 ? <Loading progress={progress} /> : <SearchBox minisearches={minisearches} />}
    </>
  )
}

export default DataLoader
