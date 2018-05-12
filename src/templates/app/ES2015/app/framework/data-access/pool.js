const oracledb = require('oracledb');
const Promise = require('bluebird');

/*
 * ------------------------------------------------------------
 * oracledb implementation saves the whole pool object in cache,
 * we will hold the pool alias only in an array to enhance
 * performance and to evade duplicate same functionality,
 * also the wrapper methods will use the oracledb's functions to
 * create, get, closeConnection pools; which will handle the cache object.
 * ------------------------------------------------------------
 * currently we will save the pool aliases to track added pools
 * to closeConnection them on application closeConnection
 */
const poolCache = {};

module.exports.preparePoolOptions = (options) => {
  const opts = options;
  if (options === undefined || options.locale === undefined) { throw new Error('Invalid parameters'); }
  if (options.alias === undefined) { opts.alias = options.locale; }
  if (options.createIfNotExists === undefined) { opts.createIfNotExists = true; }
  return opts;
};

module.exports.createPool = (options, requestId) => {
  Logger.debug('oracle::createPool', 'Create Pool', options.locale, requestId);
  const opts = this.preparePoolOptions(options);
  const poolOptions = {
    poolAlias: opts.alias,
    _enableStats: true,
    poolMax: parseInt(AppConfigs.locales[opts.locale].dbConfig.maxPoolSize, 10) || 40,
    poolPingInterval: 0,
    user: AppConfigs.locales[opts.locale].dbConfig.user,
    password: AppConfigs.locales[opts.locale].dbConfig.passWord,
    connectString: AppConfigs.locales[opts.locale].dbConfig.dataSource,
  };
  return new Promise((resolve, reject) => {
    oracledb.createPool(
      poolOptions,
      (err, pool) => {
        if (err) {
          Logger.error('createPool', 'Pool cannot be created', options.locale, requestId, { alias: opts.alias });
          reject(err);
        }
        if (pool) {
          Logger.debug('createPool', 'Pool created', options.locale, requestId, { alias: opts.alias });
          poolCache[opts.alias] = pool;
          resolve(pool);
        }
      }
    );
  });
};

module.exports.getPool = (options, requestId) => {
  const opts = this.preparePoolOptions(options);
  return new Promise((resolve, reject) => {
    try {
      Logger.debug('oracle::getPool', 'get pool from driver', options.locale, requestId);
      // const pool = oracledb.getPool(opts.alias); get using oracledb
      const pool = poolCache[opts.alias];
      if (pool) {
        Logger.debug('oracle::getPool', 'pool retrieved', options.locale, requestId);
        resolve(pool);
      } else {
        throw new Error('njs-047'); /* reject('Cannot get pool'); */
      } // simulate oracledb pool not found exception
    } catch (exception) {
      if (exception && exception.message && typeof (exception.message) === 'string' && exception.message.toLowerCase().startsWith('njs-047')) {
        // pool not found
        if (opts.createIfNotExists) {
          // create pool if allowed
          this.createPool(opts)
            .then(pool => resolve(pool))
            .catch(err => reject(err));
        } else { reject(exception); }
      } else { reject(exception); }
    }
  });
};

module.exports.closePool = (options) => {
  Logger.debug('oracle::closePool', 'close pool', options.locale);
  const opts = this.preparePoolOptions(options);
  return this.getPool(opts)
    .then(pool => pool.close())
    .then(() => {
      Logger.debug('oracle::closePool', 'pool closed', options.locale);
      // remove pool from tracking array
      const index = poolCache.indexOf(opts.alias);
      if (index !== -1) poolCache.splice(index, 1);
      return true;
    });
};

module.exports.closeAllPools = () => Promise.each(poolCache, alias => this.closePool({ locale: alias, alias, createIfNotExists: false })
  .then(() => Logger.debug(`Pool '${alias}' closed`))
  .catch(() => { Logger.error(`Pool '${alias}' cannot be closed`); }));

/* eslint-disable no-underscore-dangle */
module.exports.getPoolStats = (pool) => {
  if (!pool) return {};
  let averageTimeInQueue = 0;
  if (pool.queueRequests && pool._totalRequestsEnqueued !== 0) {
    averageTimeInQueue = Math.round(pool._totalTimeInQueue / pool._totalRequestsEnqueued);
  }

  return {
    Statistics: {
      CreatedDate: new Date(pool._createdDate),
      TotalConnectionRequests: pool._totalConnectionRequests,
      TotalRequestsEnqueued: pool._totalRequestsEnqueued,
      TotalRequestsDequeued: pool._totalRequestsDequeued,
      TotalFailedRequests: pool._totalFailedRequests,
      TotalRequestTimeouts: pool._totalRequestTimeouts,
      MaxQueueLength: pool._maxQueueLength,
      TotalTimeInQueue: pool._totalTimeInQueue,
      MinTimeInQueue: pool._minTimeInQueue,
      MaxTimeInQueue: pool._maxTimeInQueue,
      AverageTimeInQueue: averageTimeInQueue,
      ConnectionsInUse: pool.connectionsInUse,
      ConnectionsOpen: pool.connectionsOpen,
    },
    Attributes: {
      PoolAlias: pool.poolAlias,
      QueueRequests: pool.queueRequests,
      QueueTimeout: pool.queueTimeout,
      PoolMin: pool.poolMin,
      PoolMax: pool.poolMax,
      PoolIncrement: pool.poolIncrement,
      PoolTimeout: pool.poolTimeout,
      PoolPingInterval: pool.poolPingInterval,
      StmtCacheSize: pool.stmtCacheSize,
    },
    EnvironmentVariables: { UV_THREADPOOL_SIZE: process.env.UV_THREADPOOL_SIZE || null },
  };
};
/* eslint-enable no-underscore-dangle */
