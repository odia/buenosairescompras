import React from 'react'

export interface HighlightsProps {
  highlights: string[]
}

const CONTEXT_LENGTH = 40
const Highlights: React.FunctionComponent<HighlightsProps> = ({ highlights }) => {
  const h = highlights.map((h, i, arr) => {
    if (i === 0) {
      return h.substring(h.length-CONTEXT_LENGTH)
    }
    else if (i === arr.length - 1) {
      return h.substring(0, CONTEXT_LENGTH)
    } else if (i % 2 === 0) {
      return h.substring(0, CONTEXT_LENGTH) + '...' + h.substring(h.length-CONTEXT_LENGTH)
    }
    return <b>{h}</b>
  })

  return (
    <>
      {h.map((s, i) => (<span key={i}>{s}</span>))}
    </>
  )
}

export default Highlights
