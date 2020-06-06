var Model = require('mongoose').Model

function softRemove(schema) {
  schema.add({
    removedAt: { type: Date, index: true }
  })

  schema.virtual('isRemoved').get(function () {
    return this.removedAt !== undefined
  }).set(function (val) {
    this.removedAt = val ? new Date() : undefined
    return this.removedAt !== undefined
  })

  const originalStaticRemove = schema.statics.remove || Model.remove
  schema.static('remove', function (conditions) {
    const softRemove = true

    if (conditions.$softRemove !== undefined) {
      softRemove = conditions.$softRemove
      delete conditions.$softRemove
    }
    conditions.removedAt = { $exists: false }

    if (softRemove === false) {
      return originalStaticRemove.call(this, conditions)
    }

    return this.update(conditions, {
      $set: { removedAt: new Date() }
    })
  })

  schema.static('restore', function (conditions) {
    conditions.removedAt = { $exists: true }

    return this.update(conditions, {
      $unset: { removedAt: 1 }
    })
  })

  const originalMethodRemove = schema.methods.remove || Model.prototype.remove
  schema.method('remove', function (opts = {}) {
    opts.softRemove === undefined && (opts.softRemove = true)

    if (opts.softRemove === false) {
      return originalMethodRemove.call(this)
    }

    if (this.isRemoved) {
      return this
    }

    this.isRemoved = true
    return this.save()
  }, { suppressWarning: true })

  schema.method('restore', function () {
    this.isRemoved = false
    return this.save()
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
