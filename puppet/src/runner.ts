import { Browser, Page } from 'puppeteer-core';
import selectors from './selectors';

const debug = require('debug')('puppet');

const BROWSERLESS_HOST = process.env.BROWSERLESS_HOST || 'localhost';
const BROWSERLESS_PORT = process.env.BROWSERLESS_PORT || '3000';
const BASE_URL = process.env.BASE_URL || 'https://www.buenosairescompras.gob.ar'

export default class Runner {
  target: string;
  browser: Browser | undefined;
  page: Page | undefined;

  constructor() {
    this.target = `ws://${BROWSERLESS_HOST}:${BROWSERLESS_PORT}`;
    debug(`will connect to ${this.target}`);
  }
  async connect() {
    this.browser = await require('puppeteer').connect({ browserWSEndpoint: this.target })
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
    this.page = await this.browser.newPage();
  }
  async wait() {
    if (!this.page) return null;
    return await this.page.waitForNetworkIdle();
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
      this.wait();
      let links = await this.page.$$(selectors.LIST_PROCESSES)

      debug(links);
      for (let l in links) {
        debug(`page: ${i - 1}\tlink: ${l}`);
        /* old links was destroyed on nav */
        links = await this.page.$$('a[href*=lnkNumeroProceso]');
        /* HACK on HACK…
         * we do this because typescript will complain if we
         * links[l].click(selectors.JS_CLICK_HACK)
         */
        const sel = await links[l].$(selectors.JS_CLICK_HACK);
        if (sel) {
          await sel.click();
          this.wait();
          this.page.goBack();
          this.wait();
        }
      };

      await this.page.evaluate(`__doPostBack('ctl00$CPH1$GridListaPliegos','Page$${i}')`)
    }
  }
}
