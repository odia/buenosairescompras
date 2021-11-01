import React, { useState, useEffect } from 'react'
import MiniSearch, { SearchResult } from 'minisearch'
const { decompress } = require('lz-string')

export interface SearchBoxProps {
  minisearches: MiniSearch[]
}

const SearchBox: React.FunctionComponent<SearchBoxProps> = ({ minisearches }) => {
  const [criteria, setCriteria] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])

  useEffect(() => {
    if (criteria.length < 3) {
      setResults([])
      return
    }
    setResults(minisearches
        .flatMap((ms) => ms.search(criteria))
        .sort((r1, r2) => - (r1.score - r2.score))
        .slice(0, 10)
        )
  }, [criteria, minisearches])

  return (
    <>
      <input type="text" value={criteria} onChange={(e) => setCriteria(e.target.value)} />
      {results.length > 0 && (<table>
        {results.map((r) => (
          <tr key={r.id}>
            <td><a href={r.id} target="_blank" rel="noreferrer">{r['tender/description']}</a></td>
            <td>{ decompress(r.compressed) }</td>
          </tr>
        ))}
      </table>)}
    </>
  )
}

export default SearchBox
