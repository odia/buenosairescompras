import fetchProgress from 'fetch-progress'
import { NUM_MINISEARCH, MS_CONFIG } from 'bac-shared'
import MiniSearch from 'minisearch'
import { decompress } from 'lz-string'
import { fuzzyMatch } from 'fuzzbunny'

const minisearches = []

const range = function(from: number, to: number) {
    const arr = []
    for(let i = from; i <= to; i++) arr.push(i)
    return arr
};

export async function init(f) {
    let totalRequestsSize: number[] = [];
    const requestsTransferredSize = range(0, NUM_MINISEARCH).map(() => 0)
    const addError = (err: string) => {
      console.error(err)
      global.self.postMessage(['setFailed', true])
    }
    const updateProgress = () => {
      global.self.postMessage(['setProgress', (
        requestsTransferredSize.reduce((a, b) => a + b, 0) /
        totalRequestsSize.reduce((a, b) => a + b, 0)
      )])
    }

    await fetch("/data/index.json")
      .then((res) => res.json())
      .then(async (data: {url: string, size: number}[]) => {
        totalRequestsSize = data.map((x) => x.size)
        return await Promise.all(
          data.map((x, i) => fetch('/data/' + x.url)
            .then(fetchProgress({
              onProgress(progress) {
                requestsTransferredSize[i] = progress.transferred
                updateProgress()
              },
              onError(err) {
                addError(err);
              },
          }))
          .then((res) => res.json())
          .then(async (json) => {
            requestsTransferredSize[i] = totalRequestsSize[i]
            updateProgress()
            minisearches[i] = MiniSearch.loadJS(json, MS_CONFIG)
          })
          .catch((err) => addError(err))
        )
      )
    })
    .catch((err) => addError(err))
    global.self.postMessage(['setReady', true])
}


export async function search(criteria) {
  return minisearches
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
      })
}
