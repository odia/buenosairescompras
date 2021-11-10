const fs = require('fs')
const csvparse = require('csv-parse')
const assert = require('assert')
const htmlparse = require('node-html-parser').parse;
const { compress } = require('lz-string')
const MiniSearch = require('minisearch')
const { MS_CONFIG, COLS, NUM_MINISEARCH } = require('bac-shared')

const range = function*(from,to) {
    for(let i = from; i <= to; i++) yield i;
};

const BUFFER_SIZE = 1000;
const PATH = process.argv[2] === 'sample' ? '../data/sample.csv' : '../data/releases_documents_items.csv'
const minisearches = [...range(0, NUM_MINISEARCH)].map(() => new MiniSearch(MS_CONFIG))

const urls = []
let buffer = []
let i = 0
const addDocuments = () => {
  minisearches[i++ % NUM_MINISEARCH].addAll(buffer)
  buffer = []
  process.stderr.write(`writing to bucket ${i}\n`)
}

fs.createReadStream(PATH)
  .pipe(csvparse({ columns: true }))
  .on('error', console.error)
  .on('data', (row) => {
    const url = row['tender/documents/0/url']
    if (url === '') return;
    if (urls.includes(url)) return
    urls.push(url)
    const doc = Object.fromEntries(Object.entries(row).filter(([k, v]) => COLS.includes(k)))
    const f = '../data/' + url.replace(/\//g, '_')
    const html = fs.readFileSync(f, 'utf8')
    const dom = htmlparse(html)
    const relevant = dom.querySelector('div#divImprimir')
    dom.querySelectorAll('script').forEach((s) => s.remove())
    doc.id = doc['tender/documents/0/url']
    doc.content = relevant ? relevant.text.toString().replace(/\s+\n+\s+/g, '\n') : ''
    doc.compressed = compress(doc.content)
    buffer.push(doc)
    if (buffer.length === BUFFER_SIZE) {
      addDocuments()
    }
  })
  .on('end', async () => {
    addDocuments()
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
