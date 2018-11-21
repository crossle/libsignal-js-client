var signal = { db: {} };

signal.db.getSchemaBuilder = function() {
  var ds = lf.schema.create('signal', 1);
  ds.createTable('identities').
      addColumn('id', lf.Type.INTEGER).
      addColumn('address', lf.Type.STRING).
      addColumn('registration_id', lf.Type.INTEGER).
      addColumn('public_key', lf.Type.STRING).
      addColumn('private_key', lf.Type.STRING).
      addPrimaryKey(['id'], true).
      addUnique('uq_address', ['address']).
      addNullable(['registration_id', 'private_key']);

  ds.createTable('prekeys').
      addColumn('prekey_id', lf.Type.INTEGER).
      addColumn('record', lf.Type.STRING).
      addPrimaryKey(['prekey_id']);

  ds.createTable('signed_prekeys').
      addColumn('prekey_id', lf.Type.INTEGER).
      addColumn('record', lf.Type.STRING).
      addPrimaryKey(['prekey_id']);

  ds.createTable('sessions').
      addColumn('address', lf.Type.STRING).
      addColumn('device', lf.Type.INTEGER).
      addColumn('record', lf.Type.STRING).
      addPrimaryKey(['address', 'device']);

  ds.createTable('sender_keys').
      addColumn('group_id', lf.Type.STRING).
      addColumn('sender_id', lf.Type.STRING).
      addColumn('record', lf.Type.STRING).
      addPrimaryKey(['group_id', 'sender_id']);

  return ds;
};