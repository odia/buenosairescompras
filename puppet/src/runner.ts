import { Browser, Page } from 'puppeteer-core';
import selectors from './selectors';

const EventEmitter = require('events');
const debug = require('debug')('puppet');

const BROWSERLESS_HOST = process.env.BROWSERLESS_HOST || 'localhost';
const BROWSERLESS_PORT = process.env.BROWSERLESS_PORT || '3000';
const BASE_URL = process.env.BASE_URL || 'https://www.buenosairescompras.gob.ar'

export default class Runner extends EventEmitter {
  target: string;
  browser: Browser | undefined;
  page: Page | undefined;

  constructor() {
    super();
    this.target = `ws://${BROWSERLESS_HOST}:${BROWSERLESS_PORT}`;
    debug(`will connect to ${this.target}`);
  }
  close() {
    if (this.browser) this.browser.close();
  }
  async connect() {
    this.browser = this.browser || await require('puppeteer').connect({ browserWSEndpoint: this.target })
      .catch(() => {
        debug(`
COULD NOT CONNECT TO BROWSERLESS
will try to spawn a chromedriver instance for you to debug`)
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

  public async run() {
    await this.connect();

    if (!this.page || !this.browser) {
      debug("error in connect()", this.page, this.browser);
      return null;
    }

    await this.page.goto(`${BASE_URL}`, {
      waitUntil: 'networkidle2'
    })
    /* required as browsing directly seems to fail */
    await this.page.click(selectors.LAST_DAYS_A);
    for (let i = 2; i < 20; i++) {
      await this.page.waitForSelector(selectors.LIST_PROCESSES);

      const count = await this.page.evaluate((sel) =>
        document.querySelectorAll(sel).length, selectors.LIST_PROCESSES);

      for (let l = 0; l < count; l++) {
        debug(`page: ${i - 1}\tlink: ${l + 1}/${count}`);
        /* old links was destroyed on nav */
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
      };

      await this.page.evaluate(`__doPostBack('ctl00$CPH1$GridListaPliegos','Page$${i}')`)
    }
    this.emit("done");
  }
}
