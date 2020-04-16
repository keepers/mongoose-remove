var Model = require('mongoose').Model

function softRemove (schema) {
  schema.add({
    removedAt: { type: Date, index: true }
  })

  schema.virtual('isRemoved').get(function () {
    return this.removedAt !== undefined
  }).set(function (val) {
    this.removedAt = val ? new Date() : undefined
    return this.removedAt !== undefined
  })

  var originalStaticRemove = schema.statics.remove || Model.remove
  schema.static('remove', function (conditions, cb) {
    var softRemove = true

    if (conditions.$softRemove !== undefined) {
      softRemove = conditions.$softRemove
      delete conditions.$softRemove
    }
    conditions.removedAt = { $exists: false }

    if (softRemove === false) {
      return originalStaticRemove.call(this, conditions, cb)
    }

    this.update(conditions, {
      $set: { removedAt: new Date() }
    }, cb)
  })

  schema.static('restore', function (conditions, cb) {
    conditions.removedAt = { $exists: true }
    this.update(conditions, {
      $unset: { removedAt: 1 }
    }, cb)
  })

  var originalMethodRemove = schema.methods.remove || Model.prototype.remove
  schema.method('remove', function (opts, cb) {
    if (typeof opts === 'function') {
      cb = opts
      opts = {}
    }

    opts || (opts = {})
    opts.softRemove === undefined && (opts.softRemove = true)

    if (opts.softRemove === false) {
      return originalMethodRemove.call(this, cb)
    }

    if (this.isRemoved) {
      return cb(null, this, 0)
    }

    this.isRemoved = true
    this.save(cb)
  })

  schema.method('restore', function (cb) {
    this.isRemoved = false
    this.save(cb)
  })

  var setIsRemoved = function (next) {
    var conditions = this.getQuery()

    if (conditions.isRemoved !== undefined) {
      conditions.removedAt = { $exists: !!conditions.isRemoved }
      delete conditions.isRemoved
    }
    if (conditions.removedAt === undefined) {
      conditions.removedAt = { $exists: false }
    }
    next(null)
  }

  schema.pre('count', setIsRemoved)
  schema.pre('update', setIsRemoved)
  schema.pre('find', setIsRemoved)
  schema.pre('findOne', setIsRemoved)
  schema.pre('findOneAndRemove', setIsRemoved)
  schema.pre('findOneAndUpdate', setIsRemoved)
}

module.exports = softRemove
