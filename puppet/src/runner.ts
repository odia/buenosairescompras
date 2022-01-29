import { Browser, Page } from 'puppeteer-core';
import selectors from './selectors';

const EventEmitter = require('events');
const debug = require('debug')('puppet');

export default class Runner extends EventEmitter {
  config: {
    BROWSERLESS_HOST: string;
    BROWSERLESS_PORT: string;
    BASE_URL: string;
  };
  target: string;
  browser: Browser | undefined;
  page: Page | undefined;

  constructor(config) {
    super();
    this.target = `ws://${config.BROWSERLESS_HOST}:${config.BROWSERLESS_PORT}`;
    this.config = config;
    debug(`will connect to ${this.target}`);
  }
  close() {
    if (this.browser) this.browser.close();
  }
  async connect() {
    this.browser = this.browser || await require('puppeteer').connect({ browserWSEndpoint: this.target })
      .catch(() => {
        debug(`
⚠ COULD NOT CONNECT TO BROWSERLESS
🦄 will try to spawn a chromedriver instance for you to debug`)
        return require('puppeteer').launch({
          headless: false
        })
      });
    if (!this.browser) {
      debug("couldn't init Browser");
      return null;
    };
    this.page = this.page || await this.browser.newPage();
    this.emit("ready")
  }
  async wait() {
    if (!this.page) return null;
    return await this.page.waitForNetworkIdle();
  }
  process(data) {
    const p = data.reduce((a, e) => {
      if (!e[1]) return a;

      const [_, cat, field, label] =
        e[0].match(/.*_UC([^_]+)_(?:UC_|usr)?([^_]*)_(?:lbl|rpt|gv)?([^_]+)/);

      if (!a[cat]) a[cat] = {};
      if (!a[cat][field]) a[cat][field] = {};
      if (!a[cat][field][label]) {
        a[cat][field][label] = e[1];
      } else if (!(a[cat][field][label] instanceof Array)) {
        a[cat][field][label] = [a[cat][field][label], e[1]];
      } else {
        a[cat][field][label].push(e[1])
      }

      return a;
    }, {})
    this.emit("data", p);
    return p;
  }

  async gotoPage(p) {
    const pagePostBack = `__doPostBack('ctl00$CPH1$GridListaPliegos','Page$${p}')`;

    const pages = await this.page.evaluate(sel => {
      const ret = [];
      document.querySelectorAll(sel).forEach(d => {
        ret.push(d.getAttribute('href'))
      })
      return ret;
    }, selectors.PAGES_LIST_HACK);

    if (new Set(pages).has(`javascript:${pagePostBack}`)) {
      await this.page.evaluate(pagePostBack);
      return true;
    }

    debug(`${pagePostBack} not found, returning false`)
    return false;
  }
  public async run() {
    await this.connect();

    if (!this.page || !this.browser) {
      debug("error in connect()", this.page, this.browser);
      return null;
    }

    await this.page.goto(`${this.config.BASE_URL}`, {
      waitUntil: 'networkidle2'
    })
    /* required as browsing directly seems to fail */
    await this.page.click(selectors.LAST_DAYS_A);
    let p = 1;
    do {
      await this.page.waitForSelector(selectors.LIST_PROCESSES);

      const count = await this.page.evaluate((sel) =>
        document.querySelectorAll(sel).length, selectors.LIST_PROCESSES);

      for (let l = 0; l < count; l++) {
        debug(`page: ${p}\tlink: ${l + 1}/${count}`);
        const links = await this.page.$$('a[href*=lnkNumeroProceso]');

        links[l].click();
        await this.page.waitForSelector(selectors.LIST_FIELDS);
        const data = [];
        const fields = await this.page.$$(selectors.LIST_FIELDS);
        for (let f in fields) {
          data.push(await fields[f].evaluate(node => [node.id, (node as HTMLElement).innerText]))
        }
        this.process(data);
        this.page.goBack();
        await this.page.waitForSelector(selectors.LIST_PROCESSES);
      }
    } while (await this.gotoPage(++p));

    this.emit("done");
  }
}
