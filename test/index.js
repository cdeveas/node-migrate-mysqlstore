var path = require('path')

var getStoreUnderTest = function (base) {
  return { Store: require('..'), args: [ { user: 'root', password: 'password', database: 'mysql' } ] }
}

var BASIC_BASE = path.join(__dirname, '..', 'node-migrate', 'test', 'common', 'fixtures', 'basic')
var basicTests = require('../node-migrate/test/common/basic')
describe('basic migration', basicTests(BASIC_BASE, getStoreUnderTest(BASIC_BASE)))

var ISSUE33_BASE = path.join(__dirname, '..', 'node-migrate', 'test', 'common', 'fixtures', 'issue-33')
var issue33 = require('../node-migrate/test/common/issue-33')
describe('issue-33', issue33(ISSUE33_BASE, getStoreUnderTest(ISSUE33_BASE)))
