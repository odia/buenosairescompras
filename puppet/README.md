Puppet-based scrapper for buenosairescompras.gob.ar (and alikes)
===

This is a simple hack, you should probably use the included `docker-compose.yml` to run it,
it has 2 modes:

 - if it finds a browserless/chrome running on `BROWSERLESS_HOST`:`BROWSERLESS_PORT` (defaults to `localhost:3000`) it will connect there and do everything silently.
 - if it doesn't it'll try to launch a chromiumbrowser localy, but you need to set that up, just google 'chromedriver'
 
 the data will be dumped in `/data` as single json files, we recomend you maintain it with git to track changes.
