const siteRepository = require('../../repository/site');
const _ = require('lodash');
const pools = require('../../../framework/data-access/pool');
const os = require('os');

module.exports.controller = (req, res) => {
  Logger.info('controller::Healthycheck', 'start healthycheck', 'US', req.id);
  const timeOffset = Math.abs((new Date()).getTimezoneOffset());
  return Promise.all([
    siteRepository.getSite('US', req.id),
    pools.getPool({ locale: 'US' }).then(pool => pools.getPoolStats(pool)),
  ])
    .then((results) => {
      Logger.info('controller::Healthycheck', 'end healthycheck', 'US', req.id);
      const result = {
        application: {
          appName: AppConfigs.app.name,
          appVersion: AppConfigs.app.version,
          environment: AppConfigs.environment,
        },
        request: {
          locale: 'US',
          requestId: req.id,
          url: req.url,
        },
        server: {
          hostname: os.hostname(),
          port: AppConfigs.port,
          os: os.platform(),
          node: process.version,
          currentTime: new Date(),
          timezone: `${(new Date()).getTimezoneOffset() > 0 ? '-' : '+'}${timeOffset / 60 > 9 ? '' : '0'}${timeOffset / 60}:${timeOffset % 60 > 9 ? '' : '0'}${timeOffset % 60}`,
          environment: {
            NLS_DATE_FORMAT: process.env.NLS_DATE_FORMAT || null,
            NLS_LANG: process.env.NLS_LANG || null,
            ORA_SDTZ: process.env.ORA_SDTZ || null,
          },
        },
        database: {
          status: 'live'
        },
      };
      return res.json(result);
    });
};

module.exports.route = '/healthcheck';
