/**
 * Database Configuration
 * Uses NeDB (file-based, MongoDB-compatible) for zero-config setup.
 * Swap to real MongoDB by replacing with mongoose connections.
 */
const Datastore = require('nedb-promises');
const path = require('path');

const dbDir = path.join(__dirname, '..', 'db_data');

const db = {
  users: Datastore.create({ filename: path.join(dbDir, 'users.db'), autoload: true }),
  products: Datastore.create({ filename: path.join(dbDir, 'products.db'), autoload: true }),
  prices: Datastore.create({ filename: path.join(dbDir, 'prices.db'), autoload: true }),
  priceHistory: Datastore.create({ filename: path.join(dbDir, 'priceHistory.db'), autoload: true }),
  alerts: Datastore.create({ filename: path.join(dbDir, 'alerts.db'), autoload: true }),
  wishlist: Datastore.create({ filename: path.join(dbDir, 'wishlist.db'), autoload: true }),
  searchLogs: Datastore.create({ filename: path.join(dbDir, 'searchLogs.db'), autoload: true }),
};

// Create indexes for performance
db.users.ensureIndex({ fieldName: 'email', unique: true });
db.products.ensureIndex({ fieldName: 'name' });
db.products.ensureIndex({ fieldName: 'category' });
db.prices.ensureIndex({ fieldName: 'productId' });
db.priceHistory.ensureIndex({ fieldName: 'productId' });
db.alerts.ensureIndex({ fieldName: 'userId' });
db.wishlist.ensureIndex({ fieldName: 'userId' });

module.exports = db;
