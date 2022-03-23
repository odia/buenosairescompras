import Runner from './runner';
import { writeFile } from 'fs';

const path = require('path');

const puppet = new Runner({
  BROWSERLESS_HOST: process.env.BROWSERLESS_HOST || "localhost",
  BROWSERLESS_PORT: process.env.BROWSERLESS_PORT || "3000",
  BASE_URL: process.env.BASE_URL || 'https://www.buenosairescompras.gob.ar'
});

const z = (d, n=2) => {
  let s = d.toString();
  while (s.length < n) {
    s = '0' + s;
  }
  return s;
}

puppet.on('data', d => {
  const nump = d.VistaPreviaPliego.CabeceraPliego.NumPliego;

  try {
    const [_, D,M,Y,H] = d.VistaPreviaPliego.Cronograma.FechaPublicacion
                          .match(/(\d+)\/(\d+)\/(\d+) (.*)/);
    const sdate = `${Y}${z(M)}${z(D)}_${H}`;
    const fn = path.resolve(`${__dirname}/../../data/${sdate}_${nump}.json`)
    writeFile(fn,
            JSON.stringify(d, null, 2), err => {
              if (err) return console.error(`couldn't write file data/${nump}.json: ${err}`);
              console.log(`wrote ${fn}`);

    })
  } catch(e) {
    console.error(d);
  }


});

puppet.on('disconnected', () => {
  console.error(`reconnecting, at ${puppet.state}`);
  puppet.connect();
})

puppet.on('done', () => {
  console.error('done')
  puppet.close();
});

puppet.run();
