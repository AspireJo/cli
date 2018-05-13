const repo = require('../repository/healthcheck');
const _ = require('lodash');
const pools = require('../../../framework/data-access/pool');
const os = require('os');

/**
 * API healthcheck
 * @returns {healthcheck}
 * @property {string} route - /healthcheck
 */
module.exports.controller = (req, res) => {
  Logger.info('controller::Healthycheck', 'start healthycheck', 'US', req.id);
  const timeOffset = Math.abs((new Date()).getTimezoneOffset());
  return Promise.all([
    // repo.healthcheck('US', req.id),
    pools.getPool({ locale: 'US' }).then(pool => pools.getPoolStats(pool)),
  ])
    .then((results) => {
      Logger.info('controller::Healthycheck', 'end healthycheck', 'US', req.id);
      const result = {
        appName: AppConfigs.app.name,
        appVersion: AppConfigs.app.version,
        environment: AppConfigs.environment,
        locale: 'US',
        requestId: req.id,
        requestUrl: req.url,
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
        databaseStatus: 'live'
      };
      return res.json(result);
    });
};

module.exports.route = '/healthcheck';
