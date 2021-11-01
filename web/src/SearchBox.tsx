import React, { useState, useEffect } from 'react'
import MiniSearch, { SearchResult } from 'minisearch'

export interface SearchBoxProps {
  minisearches: MiniSearch[]
}

const SearchBox: React.FunctionComponent<SearchBoxProps> = ({ minisearches }) => {
  const [criteria, setCriteria] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])

  useEffect(() => {
    setResults(minisearches
        .flatMap((ms) => ms.search(criteria))
        .sort((r1, r2) => - (r1.score - r2.score))
        .slice(0, 10)
        )
  }, [criteria, minisearches])

  return (
    <>
      <input type="text" value={criteria} onChange={(e) => setCriteria(e.target.value)} />
      {results.map((r) => <p key={r.id}><a href={r.id} target="_blank" rel="noreferrer">{r['tender/description']}</a></p>)}
    </>
  )
}

export default SearchBox
