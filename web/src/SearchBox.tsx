import React, { useState, useEffect } from 'react'
import MiniSearch, { SearchResult } from 'minisearch'
import { decompress } from 'lz-string'
import { fuzzyMatch } from 'fuzzbunny'
import Highlights from './Highlights'

export interface SearchBoxProps {
  minisearches: MiniSearch[]
}

interface ExtendedSearchResult {
  searchResult: SearchResult
  text: string
  highlights: string[]
}

const SearchBox: React.FunctionComponent<SearchBoxProps> = ({ minisearches }) => {
  const [criteria, setCriteria] = useState('')
  const [results, setResults] = useState<ExtendedSearchResult[]>([])

  useEffect(() => {
    if (criteria.length < 3) {
      setResults([])
      return
    }
    setResults(minisearches
        .flatMap((ms) => ms.search(criteria, { fuzzy: 0.2 }))
        .sort((r1, r2) => - (r1.score - r2.score))
        .slice(0, 10)
        .map((searchResult) => {
          const text = decompress(searchResult.compressed) || ''
          const match = fuzzyMatch(text, criteria)
          const highlights = match ? match.highlights: []
          return {
            searchResult,
            text,
            highlights,
          }
        }))
  }, [criteria, minisearches])

  return (
    <>
      <input type="text" value={criteria} onChange={(e) => setCriteria(e.target.value)} />
      {results.length > 0 && (<table>
        {results.map((r) => (
          <tr key={r.searchResult.id}>
            <td><a href={r.searchResult.id} target="_blank" rel="noreferrer">{r.searchResult['tender/description']}</a></td>
            <td><Highlights highlights={r.highlights} /></td>
          </tr>
        ))}
      </table>)}
    </>
  )
}

export default SearchBox
