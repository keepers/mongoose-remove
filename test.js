var assert = require('assert')
var sinon = require('sinon')
var mongooseSoftRemove = require('./')
var schemaMock = require('./schema-mock')

describe('mongooseSoftRemove()', function () {
  it('accepts a schema object', sinon.test(function () {
    mongooseSoftRemove(schemaMock)
  }))

  it('adds a removedAt field', sinon.test(function () {
    mongooseSoftRemove(schemaMock)
    sinon.assert.calledWith(schemaMock.add, {
      removedAt: { type: Date, index: true }
    })
  }))

  it('adds a virtual isRemoved field', sinon.test(function () {
    mongooseSoftRemove(schemaMock)
    sinon.assert.calledWith(schemaMock.virtual, 'isRemoved')
  }))

  it('overrides schema.statics.remove()', sinon.test(function () {
    mongooseSoftRemove(schemaMock)
    sinon.assert.calledWith(schemaMock.static, 'remove')
  }))

  it('overrides schema.methods.remove()', sinon.test(function () {
    mongooseSoftRemove(schemaMock)
    sinon.assert.calledWith(schemaMock.method, 'remove')
  }))

  it('adds schema.statics.restore()', sinon.test(function () {
    mongooseSoftRemove(schemaMock)
    sinon.assert.calledWith(schemaMock.static, 'restore')
  }))

  it('adds schema.methods.restore()', sinon.test(function () {
    mongooseSoftRemove(schemaMock)
    sinon.assert.calledWith(schemaMock.method, 'restore')
  }))

  it('adds a pre count hook', sinon.test(function () {
    mongooseSoftRemove(schemaMock)
    sinon.assert.calledWith(schemaMock.pre, 'count')
  }))

  it('adds a pre update hook', sinon.test(function () {
    mongooseSoftRemove(schemaMock)
    sinon.assert.calledWith(schemaMock.pre, 'update')
  }))

  it('adds a pre find hook', sinon.test(function () {
    mongooseSoftRemove(schemaMock)
    sinon.assert.calledWith(schemaMock.pre, 'find')
  }))

  it('adds a pre findOne hook', sinon.test(function () {
    mongooseSoftRemove(schemaMock)
    sinon.assert.calledWith(schemaMock.pre, 'findOne')
  }))

  it('adds a pre findOneAndRemove hook', sinon.test(function () {
    mongooseSoftRemove(schemaMock)
    sinon.assert.calledWith(schemaMock.pre, 'findOneAndRemove')
  }))

  it('adds a pre findOneAndUpdate hook', sinon.test(function () {
    mongooseSoftRemove(schemaMock)
    sinon.assert.calledWith(schemaMock.pre, 'findOneAndUpdate')
  }))
})

describe.skip('schema.statics.remove()', function () {
  it('adds `removedAt: new Date()` to the document', sinon.test(function () {
    mongooseSoftRemove(schemaMock)

    assert.equal(schemaMock.static.getCall(0).args[0], 'remove')

    var staticRemove = schemaMock.static.getCall(0).args[1]
    var clock = sinon.useFakeTimers()
    var cb = sinon.stub()
    var Model = {
      update: sinon.stub().callsArgWith(2, null, {
        nModified: 1,
        nMatched: 1
      })
    }

    staticRemove.call(Model, { key: 'val' }, cb)

    sinon.assert.calledWith(Model.update, {
      key: 'val',
      removedAt: { $exists: false }
    }, {
      $set: { removedAt: new Date() }
    })
    sinon.assert.calledWith(cb, null, {
      nModified: 1,
      nMatched: 1
    })
  }))

  it('removes the document if `$softRemove: false` is added to the conditions', sinon.test(function () {
    mongooseSoftRemove(schemaMock)

    var staticRemove = schemaMock.static.getCall(0).args[1]
    var clock = sinon.useFakeTimers()
    var cb = sinon.stub()
    var Model = {}

    schemaMock.statics.remove.callsArgWith(1, null, {
      nModified: 1,
      nMatched: 1
    })

    staticRemove.call(Model, {
      key: 'val',
      $softRemove: false
    }, cb)

    sinon.assert.calledWith(schemaMock.statics.remove, {
      removedAt: { $exists: false },
      key: 'val'
    })
    sinon.assert.calledWith(cb, null, {
      nModified: 1,
      nMatched: 1
    })
  }))
})

describe.skip('schema.methods.remove()', function () {
  it('adds `isRemoved: true` to the document', sinon.test(function () {
    mongooseSoftRemove(schemaMock)

    assert.equal(schemaMock.method.getCall(0).args[0], 'remove')

    var remove = schemaMock.method.getCall(0).args[1]
    var clock = sinon.useFakeTimers()
    var cb = sinon.stub()
    var document = {
      save: sinon.stub().callsArgWith(0, null, {
        nModified: 1,
        nMatched: 1
      })
    }

    remove.call(document, cb)

    assert.equal(document.isRemoved, true)
    sinon.assert.called(document.save)
    sinon.assert.calledWith(cb, null, {
      nModified: 1,
      nMatched: 1
    })
  }))

  it('removes the document if softRemove: false is added to the conditions', sinon.test(function () {
    mongooseSoftRemove(schemaMock)

    var remove = schemaMock.method.getCall(0).args[1]
    var clock = sinon.useFakeTimers()
    var cb = sinon.stub()
    var document = {}

    schemaMock.methods.remove.callsArgWith(0, null, {
      nModified: 1,
      nMatched: 1
    })

    remove.call(document, { softRemove: false }, cb)

    sinon.assert.called(schemaMock.methods.remove)
    sinon.assert.calledWith(cb, null, {
      nModified: 1,
      nMatched: 1
    })
  }))
})

describe.skip('schema.statics.restore()', function () {
  it('set `isRemoved: false`, and removes `removedAt` from the document', sinon.test(function () {
    mongooseSoftRemove(schemaMock)

    assert.equal(schemaMock.static.getCall(1).args[0], 'restore')

    var staticRestore = schemaMock.static.getCall(1).args[1]
    var cb = sinon.stub()
    var Model = {
      update: sinon.stub().callsArgWith(2, null, {
        nModified: 1,
        nMatched: 1
      })
    }

    staticRestore.call(Model, { key: 'val' }, cb)

    sinon.assert.calledWith(Model.update, {
      key: 'val',
      removedAt: { $exists: true }
    }, {
      $unset: { removedAt: 1 }
    })
    sinon.assert.calledWith(cb, null, {
      nModified: 1,
      nMatched: 1
    })
  }))
})

describe.skip('schema.methods.restore()', function () {
  it('set `isRemoved: false`, and removes `removedAt` from the document', sinon.test(function () {
    mongooseSoftRemove(schemaMock)

    assert.equal(schemaMock.method.getCall(1).args[0], 'restore')

    var restore = schemaMock.method.getCall(1).args[1]
    var cb = sinon.stub()
    var document = {
      save: sinon.stub().callsArgWith(0, null, {
        nModified: 1,
        nMatched: 1
      })
    }

    restore.call(document, cb)

    assert.equal(document.isRemoved, false)
    assert.ok(!document.removedAt)
    sinon.assert.called(document.save)
    sinon.assert.calledWith(cb, null, {
      nModified: 1,
      nMatched: 1
    })
  }))
});

['count', 'update', 'find', 'findOne', 'findOneAndRemove', 'findOneAndUpdate'].forEach(function (eventName, eventHandlerIndex) {
  describe('pre ' + eventName + ' hook', function () {
    it('adds `removedAt: { $exists: false }` to the query conditions if not already defined', sinon.test(function () {
      mongooseSoftRemove(schemaMock)

      assert.equal(schemaMock.pre.getCall(eventHandlerIndex).args[0], eventName)

      var handler = schemaMock.pre.getCall(eventHandlerIndex).args[1]
      var conditions = {}
      var cb = sinon.stub()
      var query = { getQuery: function () { return conditions } }

      handler.call(query, cb)

      assert.equal(conditions.removedAt.$exists, false)
      sinon.assert.called(cb)
    }))

    it('does not add `removedAt` if already defined', sinon.test(function () {
      mongooseSoftRemove(schemaMock)

      var handler = schemaMock.pre.getCall(eventHandlerIndex).args[1]
      var conditions = { removedAt: true }
      var cb = sinon.stub()
      var query = { getQuery: function () { return conditions } }

      handler.call(query, cb)

      assert.equal(conditions.removedAt, true)
      sinon.assert.called(cb)
    }))

    it('converts `isRemoved` to `removedAt: { $exists: !!isRemoved }`', sinon.test(function () {
      mongooseSoftRemove(schemaMock)

      var handler = schemaMock.pre.getCall(eventHandlerIndex).args[1]
      var conditions = { isRemoved: true }
      var cb = sinon.stub()
      var query = { getQuery: function () { return conditions } }

      handler.call(query, cb)

      assert.equal(conditions.removedAt.$exists, true)
      sinon.assert.called(cb)
    }))
  })
})
