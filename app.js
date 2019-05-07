'use strict';

module.exports = async app => {
  await require('./lib/load_schema')(app);
  require('./lib/load_connector')(app);
};
