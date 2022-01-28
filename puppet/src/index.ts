import Runner from './runner';
import { writeFile } from 'fs';

const puppet = new Runner();
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
