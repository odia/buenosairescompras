import fetchProgress from 'fetch-progress'
import { NUM_MINISEARCH } from 'bac-shared'

const range = function(from: number, to: number) {
    const arr = []
    for(let i = from; i <= to; i++) arr.push(i)
    return arr
};

export async function getMiniSearchJSON(f) {
    let totalRequestsSize: number[] = [];
    const requestsTransferredSize = range(0, NUM_MINISEARCH).map(() => 0)
    const addError = (err: string) => {
      console.error(err)
      // eslint-disable-next-line no-restricted-globals
      self.postMessage(['setFailed', true])
    }
    const updateProgress = () => {
      // eslint-disable-next-line no-restricted-globals
      self.postMessage(['setProgress', (
        requestsTransferredSize.reduce((a, b) => a + b, 0) /
        totalRequestsSize.reduce((a, b) => a + b, 0)
      )])
    }

    return await fetch("/data/index.json")
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
            return json
          })
          .catch((err) => addError(err))
        )
      )
    })
    .catch((err) => addError(err))
}
