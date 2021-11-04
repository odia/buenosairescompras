import React, { useState, useEffect } from 'react'
import { SearchResult } from 'minisearch'
import Highlights from './Highlights'

export interface SearchBoxProps {
  searchResults: ExtendedSearchResult[]
  search: (s: string) => void
}

interface ExtendedSearchResult {
  searchResult: SearchResult
  text: string
  highlights: string[]
}

const SearchBox: React.FunctionComponent<SearchBoxProps> = ({ searchResults, search }) => {
  const [criteria, setCriteria] = useState('')

  useEffect(() => {
    if (criteria.length < 3) {
      return
    }
    search(criteria)
  }, [criteria, search])

  return (
    <>
      <input type="text" value={criteria} onChange={(e) => setCriteria(e.target.value)} />
      {searchResults.length > 0 && (<table>
        {searchResults.map((r) => (
          <tr key={r.searchResult.id}>
            <td><a href={r.searchResult.id} target="_blank" rel="noreferrer">{r.searchResult['tender/description']}</a></td>
            <td>{r.searchResult['tender/title']}</td>
            <td>{r.searchResult['tender/description']}</td>
            <td><Highlights highlights={r.highlights} /></td>
          </tr>
        ))}
      </table>)}
    </>
  )
}

export default SearchBox
