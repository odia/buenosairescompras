const fs = require('fs')
const csvparse = require('csv-parse')
const assert = require('assert')
const htmlparse = require('node-html-parser').parse;
const { compress } = require('lz-string')
const MiniSearch = require('minisearch')
const { MS_CONFIG, COLS, NUM_MINISEARCH } = require('bac-shared')
const cliProgress = require('cli-progress');

const range = function*(from,to) {
    for(let i = from; i < to; i++) yield i;
};

const PATH = process.argv[2] === 'sample' ? '../data/sample.csv' : '../data/releases_documents_items.csv'
const minisearches = [...range(0, NUM_MINISEARCH)].map(() => new MiniSearch(MS_CONFIG))

let i = 0
const urls = []

console.log('Generating index...')
const numBytes = fs.statSync(PATH).size;
const progressBar = new cliProgress.SingleBar({
  etaBuffer: 1000, // this seems to be ignored for some reason?
}, cliProgress.Presets.shades_classic);
progressBar.start(numBytes, 0)

fs.createReadStream(PATH)
  .pipe(csvparse({ columns: true }))
  .on('error', console.error)
  .on('data', (row) => {
    progressBar.increment(Object.values(row).join(',').length) // approximation of row bytes length :see_no_evil:

    const url = row['tender/documents/0/url']
    if (url === '') return;
    if (urls.includes(url)) return
    urls.push(url)
    const doc = Object.fromEntries(Object.entries(row).filter(([k, v]) => COLS.includes(k)))

    const f = '../data/' + url.replace(/\//g, '_')
    const html = fs.readFileSync(f)

    const dom = htmlparse(html)
    const relevant = dom.querySelector('div#divImprimir')
    dom.querySelectorAll('script').forEach((s) => s.remove())
    doc.id = doc['tender/documents/0/url']
    doc.content = relevant ? relevant.text.toString().replace(/\s+\n+\s+/g, '\n') : ''
    doc.compressed = compress(doc.content)
    minisearches[i++ % NUM_MINISEARCH].add(doc)
  })
  .on('end', async () => {
    progressBar.update(numBytes)
    progressBar.stop()
    const sizes = []
    await Promise.all(minisearches.map(async (ms, i) => {
      const str = JSON.stringify(ms.toJSON())
      sizes.push(str.length)
      await fs.promises.writeFile(`../data/index${i}.json`, str)
    }))
    await fs.promises.writeFile(`../data/index.json`, JSON.stringify(sizes.map((size, i) => ({
      url: `index${i}.json`,
      size,
    }))))
  })
