import Runner from './runner';
import { writeFile } from 'fs';

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
  const [_, D,M,Y,H] = d.VistaPreviaPliego.Cronograma.FechaPublicacion.match(/(\d+)\/(\d+)\/(\d+) (.*)/);
  const sdate = `${Y}${z(M)}${z(D)}_${H}`;
  writeFile(`${__dirname}/../data/${sdate}_${nump}.json`,
            JSON.stringify(d, null, 2), err => {
              if (err) return console.error(`couldn't write file data/${nump}.json: ${err}`);
      console.log(`wrote data/${nump}.json`);

    })
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
