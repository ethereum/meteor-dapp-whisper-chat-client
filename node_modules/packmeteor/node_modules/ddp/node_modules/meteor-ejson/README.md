ejson
=====

Extended JSON library; used in DDP/Meteor


EJSON is a way of embedding more than the built-in JSON types in JSON.  It
supports all types built into JSON as plain JSON, plus the following:

**Dates:**

    {"$date": MILLISECONDS_SINCE_EPOCH}

**Binary data:**

    {"$binary": BASE_64_STRING}

(The base 64 string has `+` and `/` as characters 62 and 63, and has no maximum line length)

**Escaped things** that might otherwise look like EJSON types:

    {"$escape": THING}

For example, here is the JSON value `{$date: 10000}` stored in EJSON:

    {"$escape": {"$date": 10000}}

Note that escaping only causes keys to be literal for one level down; you can
have further EJSON inside.  For example, the following is the key `$date` mapped
to a Date object:

    {"$escape": {"$date": {"$date": 32491}}}

**User-specified types:**

    {"$type": TYPENAME, "$value": VALUE}

Implementations of EJSON should try to preserve key order where they can.  Users
of EJSON should not rely on key order, if possible.

> MongoDB relies on key order.  When using EJSON with MongoDB, the
> implementation of EJSON must preserve key order.
