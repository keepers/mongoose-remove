var sinon = require('sinon')

var schemaMock = {
  add: sinon.stub(),
  static: sinon.stub(),
  method: sinon.stub(),
  pre: sinon.stub(),
  statics: { remove: sinon.stub() },
  methods: { remove: sinon.stub() },
  virtual: sinon.stub()
}

schemaMock.virtual.returns(schemaMock.virtual)
schemaMock.virtual.get = sinon.stub().returns(schemaMock.virtual)
schemaMock.virtual.set = sinon.stub().returns(schemaMock.virtual)

module.exports = schemaMock
