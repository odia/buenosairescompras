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
  state: {
    page: number,
    link: number,
    currentPage: number
  }

  constructor(config) {
    super();
    this.target = `ws://${config.BROWSERLESS_HOST}:${config.BROWSERLESS_PORT}`;
    this.config = config;
    this.state = {
      page: 1,
      link: 1,
      currentPage: 1
    }
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
    ;['disconnected', 'targetchanged', 'targetcreated', 'targetdestroyed'].map(e => this.browser.on(e, d => this.emit(`browser:${e}`, d)))

    if (!this.page) {
      const pages = await this.browser.pages();
      if (pages.length) {
        this.page = pages[0]
      } else
        this.page = await this.browser.newPage();
    }

    ;[
      'close',
      'console',
      'dialog',
      'domcontentloaded',
      'error',
      'frameattached',
      'framedetached',
      'framenavigated',
      'load',
      'metrics',
      'pageerror',
      'popup',
      'request',
      'requestfailed',
      'requestfinished',
      'response',
      'workercreated',
      'workerdestroyed',
    ].map(e => this.browser.on(e, d => this.emit (`page:${e}`, d)))
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

  pageToPostBack (p) {
    return `__doPostBack('ctl00$CPH1$GridListaPliegos','Page$${p}')`;
  }
  async gotoPage(p) {
    const pagePostBack = this.pageToPostBack(p);

    /* hack to enter on first page */
    if (this.state.currentPage === p) {
      return true;
    }

    if (Math.abs (p - this.state.currentPage) > 9) {
      this.gotoPage(this.state.currentPage + 9)
    }

    const pages = await this.page.evaluate(sel => {
      const ret = [];
      document.querySelectorAll(sel).forEach(d => {
        ret.push(d.getAttribute('href'))
      })
      return ret;
    }, selectors.PAGES_LIST_HACK);

    if (new Set(pages).has(`javascript:${pagePostBack}`)) {
      await this.page.evaluate(pagePostBack);
      this.state.currentPage = p
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

    this.state.currentPage = 1;
    await this.page.goto(`${this.config.BASE_URL}`, {
      waitUntil: 'networkidle2'
    })
    /* required as browsing directly seems to fail */
    await this.page.click(selectors.LAST_DAYS_A);

    const failed = [];

    while (await this.gotoPage(this.state.page)) {
      await this.page.waitForSelector(selectors.LIST_PROCESSES);
      const count = await this.page.evaluate((sel) =>
        document.querySelectorAll(sel).length, selectors.LIST_PROCESSES);

      for (; this.state.link <= count; this.state.link++) {

        debug(`page: ${this.state.page}\tlink: ${this.state.link}/${count}`);
        const links = await this.page.$$('a[href*=lnkNumeroProceso]');

        links[this.state.link - 1].click();
        try {
          await this.page.waitForSelector(selectors.LIST_FIELDS);
          const data = [];
          const fields = await this.page.$$(selectors.LIST_FIELDS);
          for (let f in fields) {
            data.push(await fields[f].evaluate(node => [node.id, (node as HTMLElement).innerText]))
          }
          this.process(data);
        } catch (e) {
          failed.push(Object.assign({}, this.state));
          console.error(e);
        }

        this.page.goBack();
        await this.page.waitForSelector(selectors.LIST_PROCESSES);
      }

      this.state.link = 1;
      this.state.page++;
    }

    console.error("failed", failed);
    this.emit("done");
  }
}
