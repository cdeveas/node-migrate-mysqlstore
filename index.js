'use strict'

var mysql = require('mysql')

module.exports = MysqlStore

/**
 * @param {object} options
 * @constructor
 */
function MysqlStore (options) {
  this.host = options.host || '127.0.0.1'
  this.port = options.port || 3306
  this.user = options.user || 'root'
  this.password = options.password || 'password'
  this.database = options.database || 'mysql'
  this.migrationsTable = options.migrationsTable || 'migrations'

  // Initialize the migrations migrationsTable (this is async)
  this.init(function (err) {
    if (err) throw err
  })
}

MysqlStore.cliHandler = {
  usageOptions: [
    '     --host <string>  Mysql server host',
    '     --port <number>  Mysql server port',
    '     --user <string>  Mysql user',
    '     --password <string>  Mysql password',
    '     --database <string>  Mysql database in which to save migration executions',
    '     --migrationsTable <string>  Mysql table in which to save migration executions'
  ],
  parseArg: function (arg) {
    switch (arg) {
      case '--host':
        return 'host'
      case '--port':
        return 'port'
      case '--user':
        return 'user'
      case '--password':
        return 'password'
      case '--database':
        return 'database'
      case '--migrationsTable':
        return 'migrationsTable'
    }
  }
}

MysqlStore.prototype._getConnection = function (callback) {
  var connection
  try {
    connection = mysql.createConnection({
      host: this.host,
      database: this.database,
      port: this.port,
      user: this.user,
      password: this.password
    })
  } catch (e) {
    callback(e)
  }

  callback(null, connection)
}

MysqlStore.prototype.load = function (callback) {
  var self = this
  this.lock(function (err, conn) {
    if (err) return callback(err)

    // then search for an existing title sorted by timestamp ASC, return array of results
    var sql = '\
SELECT title, operation, timestamp \
FROM ' + self.migrationsTable + ' \
ORDER BY timestamp ASC \
'
    conn.query(sql, function (err, results) {
      callback(err, results)
      conn.end()
    })
  })
}

MysqlStore.prototype.save = function (migration, callback) {
  var self = this
  return this._getConnection(function (err, conn) {
    if (err) return callback(err)
    var sql = '\
INSERT INTO ' + self.migrationsTable + ' (title, operation, timestamp) \
VALUES (' + [ migration.title, migration.operation, migration.timestamp ].map(_escape).join(',') + ')'
    _queryThenEnd(conn, sql, callback)
  })
}

MysqlStore.prototype.lock = function (callback) {
  var self = this
  this.init(function (err, conn) {
    if (err) return callback(err)
    var sql = 'LOCK TABLES ' + self.migrationsTable + ' READ'
    conn.query(sql, function (err) {
      callback(err, conn) // callback with connection so we can use it without ending it
    })
  })
}

MysqlStore.prototype.unlock = function (callback) {
  this._getConnection(function (err, conn) {
    if (err) return callback(err)
    var sql = 'UNLOCK TABLES'
    _queryThenEnd(conn, sql, callback)
  })
}

MysqlStore.prototype.reset = function (callback) {
  var self = this
  self._getConnection(function (err, conn) {
    if (err) return callback(err)
    var sql = '\
DROP TABLE ' + self.migrationsTable + ' \
'
    _queryThenEnd(conn, sql, callback)
  })
}

MysqlStore.prototype.init = function (callback) {
  var self = this
  self._getConnection(function (err, conn) {
    if (err) return callback(err)

    var sql = '\
CREATE TABLE IF NOT EXISTS ' + self.migrationsTable + ' (\
    `id` INT NOT NULL AUTO_INCREMENT, \
    `title` VARCHAR(255) NOT NULL, \
    `operation` VARCHAR(255) NOT NULL, \
    `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP, \
    PRIMARY KEY (`id`)\
)\
ENGINE = InnoDB\
'
    conn.query(sql, function (err) {
      callback(err, conn)
    })
  })
}

function _queryThenEnd (connection, sql, callback) {
  connection.query(sql, function (err) {
    if (err) return callback(err)
    connection.end(callback)
  })
}

function _escape (val) {
  return mysql.escape(val)
}
