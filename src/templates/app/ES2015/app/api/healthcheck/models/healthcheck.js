class HealthCheckModel {
  constructor() {
    /** App Name
    * @property {string}
    * @type {string}
    */
    this.appName = undefined;

    /** App Version. e.g. 1.0.0
    * @property {string}
    * @type {string}
    */
    this.appVersion = undefined;

    /** Environment
    * @property {string}
    * @type {string}
    */
    this.environment = undefined;

    /** Request Id
    * @property {string}
    * @type {string}
    */
    this.requestId = undefined;

    /** Request Url
    * @property {string}
    * @type {string}
    */
    this.requestUrl = undefined;

    /** Host Name
    * @property {string}
    * @type {string}
    */
    this.hostname = undefined;

    /** Port
    * @property {number}
    * @type {number}
    */
    this.port = undefined;

    /** Operating System
    * @property {string}
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
    * @property {string}
    * @type {string}
    */
    this.timezone = undefined;

    /** Database Status
    * @property {string} format - YYYY-MM-DDThh:mm:ss.sssZ
    * @type {string}
    */
    this.databaseStatus = undefined;
  }
}
module.exports = HealthCheckModel;
