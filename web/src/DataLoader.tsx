import React, { useState } from 'react'
import MiniSearch from 'minisearch'

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
  useState(() => {
    (async () => {
      setMinisearches(await Promise.all(range(0, NUM_MINISEARCH)
        // TODO: save to localStorage
        .map((i) => fetch(`/data/index${i}.json`)
            .then((res) => res.text())
            .then((text) => MiniSearch.loadJSON(text, MS_CONFIG))
          )
      ))
    })()
  })

  return (
    <>
      {minisearches.length === 0 ? <Loading /> : <SearchBox minisearches={minisearches} />}
    </>
  )
}

export default DataLoader
