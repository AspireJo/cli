const _ = require('lodash');
const oracledb = require('oracledb');
const Promise = require('bluebird');
const pool = require('./pool');

oracledb.Promise = Promise;
oracledb.fetchAsString = [oracledb.DATE];

function prepareDbOptions(dbOptions, locale, requestId) {
  Logger.debug('oracle::prepareDbOptions', 'merge dbOptionsDefault with dbOptions', dbOptions.locale, requestId, { dbOptions });
  const dbOptionsDefault = {
    autoCommit: true,
    close: true,
    outFormat: oracledb.OBJECT,
    connection: undefined,
  };
  return _.merge(dbOptionsDefault, dbOptions);
}

function closeConnection(connection, commit, locale, requestId) {
  Logger.debug('oracle::closeConnection', 'close connection', locale, requestId);
  const closePromise = commit ? connection.commit() : connection.rollback();
  return closePromise.then(() => connection.close());
}

function createConnection(locale, requestId) {
  const poolAlias = locale;
  Logger.debug('oracle::createConnection', 'get pool', locale, requestId, { poolAlias });

  return pool.getPool({ locale, alias: poolAlias }, requestId)
    .then((conPool) => {
      Logger.debug('oracle::createConnection', 'pool retrieved', locale, requestId, { poolAlias });
      Logger.debug('oracle::createConnection', 'get connection from pool', locale, requestId, { poolAlias: conPool.poolAlias });
      return conPool.getConnection()
        .then((con) => {
        Logger.debug('oracle::createConnection', 'connection retrieved', locale, requestId, { poolAlias });
          // eslint-disable-next-line no-underscore-dangle
        Logger.debug('oracle::createConnection', 'end create connection', locale, requestId, { poolAlias: con._pool.poolAlias });
        return con;
      });
    });
}

function getConnection(dbOptions, locale, requestId) {
  Logger.debug('oracle::getConnection', 'get connection', locale, requestId, { options: dbOptions });
  return dbOptions !== undefined && dbOptions.connection !== undefined ? Promise.resolve(dbOptions.connection) : createConnection(locale, requestId);
}

function executeQuery(strSql, connection, bindObject, dbOptions, locale, requestId) {
  /*
    map date params to string using a fixed format
    because the date time zone will vary between app server
    and database server in DST periods, in some cases an hour
    is subtstracted from the date sent to database which causes
    the saved date to be invalid espicially at the start of a day
    -ex: [MAR 30 00:00:00] is saved as [MAR 29 23:00:00] -.
    to fix the issue we sends the date as string not as date
    and the SQL MUST convert that string back to a date
  */
  // eslint-disable-next-line no-confusing-arrow
  const dbParams = _.mapValues(bindObject || {}, param => param.dir === oracledb.BIND_IN && param.type && param.type === oracledb.DATE ? {
    val: Helper.date.format(param.val, 'YYYY-MM-DD HH:mm:ss', locale), type: oracledb.STRING, dir: param.dir,
  } : param);
  dbParams.P_SITE_ID = { val: AppConfigs.locales[locale].siteId, type: oracledb.NUMBER, dir: oracledb.BIND_IN };
  const dbOptionsObj = prepareDbOptions(dbOptions);
  // eslint-disable-next-line no-underscore-dangle
  Logger.info('oracle::executeQuery', 'Start executing', locale, requestId, { poolAlias: connection._pool.poolAlias, sessionAltered: connection.SESSION_ALTERED });
  return connection.execute(strSql, dbParams, dbOptionsObj);
}

function execute(strSql, dbOptions, bindObject, locale, requestId) {
  Logger.info('oracle::execute', 'start executing sql', locale, requestId, { options: dbOptions, params: bindObject, sql: strSql });
  let connection;
  const dbOptionsObj = prepareDbOptions(dbOptions, locale, requestId);
  return getConnection(dbOptions, locale, requestId)
    .then((dbConnection) => {
      Logger.debug('oracle::createConnection', 'connection created', locale, requestId, {});
      connection = dbConnection;
      return executeQuery(strSql, connection, bindObject, dbOptionsObj, locale, requestId);
    })
    .then((results) => {
      Logger.debug('oracle::execute', 'end executing sql', locale, requestId, { options: dbOptions, params: bindObject, sql: strSql });
      if (dbOptionsObj && dbOptionsObj.close) { closeConnection(connection, true, locale, requestId); }
      return results;
    })
    .catch((err) => {
      // eslint-disable-next-line no-underscore-dangle
      Logger.error('oracle::execute', err, locale, requestId, connection && pool.getPoolStats(connection._pool));
      if (connection) closeConnection(connection, false, locale, requestId);
      throw err;
    });
}

function executeResultSet(strSql, dbOptions, bindObject, locale, requestId) {
  Logger.info('oracle::executeResultSet', 'start executing sql', locale, requestId, { options: dbOptions, params: bindObject, sql: strSql });
  const resultObj = {
    metaData: {},
    rows: [],
  };
  let connection;
  return getConnection(dbOptions, locale, requestId)
    .then((dbConnection) => {
      Logger.debug('oracle::createConnection', 'connection created', locale, requestId, {});
      connection = dbConnection;
      return executeQuery(strSql, connection, bindObject, dbOptions, locale, requestId);
    })
    .then((result) => {
      resultObj.metaData = result.outBinds.IO_CURSOR.metaData;
      return new Promise((resolve, reject) => {
        function processResultSet() {
          result.outBinds.IO_CURSOR.getRow((err, row) => {
            if (err) return reject(err);

            if (row) {
              resultObj.rows.push(row);
              // try to get another row from the result set and
              // exit recursive function prior to closing result set
              return processResultSet();
            }

            result.outBinds.IO_CURSOR.close((closeErr) => {
              if (err) Logger.error('oracle::executeResultSet', err.message, locale, requestId, { error: closeErr });
              Logger.debug('oracle::executeResultSet', 'Close result set', locale, requestId);

              connection.release((releaseErr) => {
                if (err) Logger.error('oracle::executeResultSet', err.message, locale, requestId, { error: releaseErr });
                Logger.debug('oracle::executeResultSet', 'Close result set', locale, requestId);
              });
            });
            return resolve(resultObj);
          });
        }

        processResultSet();
      });
    })
    .catch((err) => {
      Logger.error('oracle::executeResultSet', err, locale, requestId);
      if (connection) {
        // eslint-disable-next-line no-underscore-dangle
        Logger.error('oracle::executeResultSet', 'Connection pool status', locale, requestId, pool.getPoolStats(connection._pool));
        closeConnection(connection, false, locale, requestId);
      }
      throw err;
    });
}

module.exports = {
  execute,
  executeResultSet,
  closeConnection,
  createConnection,
  closeAllPools: pool.closeAllPools,
};
