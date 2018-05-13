class HealthCheckModel {
  constructor() {
    /** App Name
    * @type {string}
    */
    this.appName = undefined;

    /** App Version. e.g. 1.0.0
    * @type {string}
    */
    this.appVersion = undefined;

    /** Environment
    * @type {string}
    */
    this.environment = undefined;

    /** Request Id
    * @type {string}
    */
    this.requestId = undefined;

    /** Request Url
    * @type {string}
    */
    this.requestUrl = undefined;

    /** Host Name
    * @type {string}
    */
    this.hostname = undefined;

    /** Port
    * @type {number}
    */
    this.port = undefined;

    /** Operating System
    * @type {string}
    */
    this.os = undefined;

    /** Node Version
    * @property {string}
    * @type {string}
    */
    this.node = undefined;

    /** Server Current Time
    * @property {string} format - YYYY-MM-DDThh:mm:ss.sssZ
    * @type {string}
    */
    this.currentTime = undefined;

    /** Server TimeZone
    * @type {string}
    */
    this.timezone = undefined;

    /** Database Status
    * @property {string[]} enum - Live, Down
    * @type {string}
    */
    this.databaseStatus = undefined;
  }
}

module.exports = HealthCheckModel;
