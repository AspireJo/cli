const v1 = require('./_get.v1');

module.exports.controller = (req, res) => v1.controller(req, res);
module.exports.route = v1.route;
