import Runner from './runner';
import { writeFile } from 'fs';


const puppet = new Runner({
  BROWSERLESS_HOST: process.env.BROWSERLESS_HOST || "localhost",
  BROWSERLESS_PORT: process.env.BROWSERLESS_PORT || "3000",
  BASE_URL: process.env.BASE_URL || 'https://www.buenosairescompras.gob.ar'
});

puppet.on('data', d => {
  const nump = d.VistaPreviaPliego.CabeceraPliego.NumPliego;
  writeFile(`${__dirname}/../data/${nump}.json`,
    JSON.stringify(d, null, 2), err => {
      if (err) return console.error(`couldn't write file data/${nump}.json`);
      console.log(`wrote data/${nump}.json`);

    })
});
puppet.on('done', () => {
  puppet.close();
});
puppet.run();
