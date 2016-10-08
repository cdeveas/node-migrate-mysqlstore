/**
 * Created by arolave on 31/07/2016.
 */
var join = require('path').join;

var getStoreUnderTest = function(base) {
  return {Store: require('..'), args: [{database: 'accounts'}]}
};

var BASIC_BASE = join(__dirname, '..', 'node-migrate', 'test', 'common', 'fixtures', 'basic');
var basicTests = require('../node-migrate/test/common/basic');
describe('basic migration', basicTests(BASIC_BASE, getStoreUnderTest(BASIC_BASE)));

var ISSUE33_BASE = join(__dirname, '..', 'node-migrate', 'test', 'common', 'fixtures', 'issue-33');
var issue33 = require('../node-migrate/test/common/issue-33');
describe('issue-33', issue33(ISSUE33_BASE, getStoreUnderTest(ISSUE33_BASE)));