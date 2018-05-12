class HealthCheckModel {
  constructor() {
    this.appName = undefined;
    this.appVersion = undefined;
    this.environment = undefined;
    this.requestId = undefined;
    this.requestUrl = undefined;
    this.hostname = undefined;
    this.port = undefined;
    this.os = undefined;
    this.node = undefined;
    this.currentTime = undefined;
    this.timezone = undefined;
    this.environment = undefined;
    this.databaseStatus = undefined;
  }
}
module.exports = HealthCheckModel;
