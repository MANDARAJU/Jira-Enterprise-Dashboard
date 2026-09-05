const { Pool } = require('pg');

function createPool(database) {
  return new Pool({ host: database.host, port: database.port, database: database.database, user: database.user, password: database.password });
}

module.exports = { createPool };
