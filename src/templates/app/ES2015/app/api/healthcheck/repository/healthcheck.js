const _ = require('lodash');
const oracledb = require('oracledb');
const db = require('../../../framework/data-access');
const Sql = require('../../../framework/sql');

const sql = new Sql('app/core/sql');

const getSiteQuery = `SELECT 1 FROM DUAL`;

class HealthcheckRepository {
  healthcheck(locale, requestId) {
    Logger.info('repository::site', 'get site info', locale, requestId);
    return db.execute(getSiteQuery, {}, {}, locale, requestId)
      .then((result) => {
        Logger.info('repository::site', 'end get site info', locale, requestId);
        if (result && result.rows && result.rows.length > 0) return _.merge({}, result.rows[0], { formattedDate: Helper.date.parseLocaleTimeZone(result.rows[0].date, locale) });
        return undefined;
      });
  }  
}

module.exports = new HealthcheckRepository();
