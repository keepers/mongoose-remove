
Mongoose Soft Remove
====================

Mongoose Soft Remove is a Mongoose plugin that transparently introduces soft
deletion to mongoose. It does this by overriding built in model methods. Note
that these changed do not break compatibility with the Mongoose API; all
changes are a superset of existing functionality. Because of this you can simply
drop in this plugin and have soft delete functionality without any code changes.

When you call the static or instance remove method on a model, instead of
deleting the document, the document is marked as removed.

```javascript
Contact.remove({ name: 'Robert Hurst' });
// or
Contact.findOne({ name: 'Robert Hurst' }, function(err, contact) {
  contact.remove();
});
```

If you wish to actually delete the document instead of soft deletion you may do
so by setting `softRemove` to `false` in the options object for the remove
instance method, or by setting `$softRemove` to `false` in the query object
passed to the static remove method.

```javascript
Contact.remove({ name: 'Robert Hurst', $softRemove: false });
// or
Contact.findOne({ name: 'Robert Hurst' }, function(err, contact) {
  contact.remove({ softRemove: false });
});
```

Once a document has been soft deleted it will not be found by count, update,
find, findOne, findOneAndRemove, findOneAndUpdate, or findById unless
explicitly requested by setting `isRemoved` to `true` in the query object.

```javascript
Contact.findOne({ name: 'Robert Hurst' }, function(err, contact) {
  // contact is null
});
Contact.findOne({ name: 'Robert Hurst', isRemoved: true }, function(err, contact) {
  // contact is {
  //   _id      : 568da2931fd5055957c88f4b
  //   name     : 'Robert Hurst',
  //   isRemoved: true,
  //   removedAt: Mon Jan 04 2016 16:39:23 GMT-0800 (PST)
  // }
});
```

The library also provides a static and instance method for restoring documents.

```javascript
Contact.restore({ name: 'Robert Hurst' });
// or
Contact.findOne({ name: 'Robert Hurst', isRemoved: true }, function(err, contact) {
  contact.restore();
});
```

Things to note
--------------
This plugin adds a `removedAt` and a virtual `isRemoved` property to each schema
affected. `removedAt` is indexed. `removedAt` is only set on the document if
the document is soft deleted.
