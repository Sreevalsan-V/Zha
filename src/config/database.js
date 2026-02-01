const { Sequelize } = require('sequelize');
const config = require('./config');

let sequelize;

if (config.database.dialect === 'sqlite') {
  // SQLite configuration
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: config.database.storage,
    logging: config.database.logging,
  });
} else {
  // PostgreSQL configuration
  sequelize = new Sequelize(
    config.database.name,
    config.database.user,
    config.database.password,
    {
      host: config.database.host,
      port: config.database.port,
      dialect: config.database.dialect,
      logging: config.database.logging,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    }
  );
}

module.exports = sequelize;
