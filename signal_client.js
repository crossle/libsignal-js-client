
const go = new Go();
let mod, inst;
var signalDatabase = null;
WebAssembly.instantiateStreaming(fetch("libsignal.wasm"), go.importObject).then(async (result) => {
    mod = result.module;
    inst = result.instance;
    databaseConnect()
    await go.run(inst)
});

function getIdentityKeyPairCallback(pub, priv, regId) {
    const indentityTable = signalDatabase.getSchema().table("identities");
    const row = indentityTable.createRow({
      address: "-1",
      registration_id: regId,
      public_key: pub,
      private_key: priv
    });

    signalDatabase.insertOrReplace()
      .into(indentityTable)
      .values([row])
      .exec()
      .then(function(rows) {});
}

function getIdentityKeyPairFromStore() {
    return [pub, priv].join();
}

function generatePreKeysCallback(preKeysStr) {
    const preKeys = preKeysStr.split(","); 
    const preKeysTable = signalDatabase.getSchema().table("prekeys");
    console.log(preKeys.length)
    var rows = [];
    for (var i = 0; i < preKeys.length; i++) {
        const preKey = preKeys[i]
        const str = String.fromCharCode.apply(String, hexToBytes(preKey));
        const jn = JSON.parse(str);
        const row = preKeysTable.createRow({
            prekey_id: jn.ID,
            record: preKey 
        });
        rows.push(row);
     }
     signalDatabase.insert().into(preKeysTable).values(rows).exec()
}

function hexToBytes(hex) {
    var bytes = [];
    for (let c=0; c<hex.length; c+=2) {
      bytes.push(parseInt(hex.substr(c, 2), 16));
    }
    return bytes;
}

function generateSignedPreKeyCallback(id, serialize) {
    const signedPreKeyTable = signalDatabase.getSchema().table("signed_prekeys"); 
    const row = signedPreKeyTable.createRow({
        prekey_id: id,
        record: serialize
    });
    signalDatabase.insert().into(signedPreKeyTable).values([row]).exec()
}

function goGenerateSignedPreKey() {
    const indentityTable = signalDatabase.getSchema().table("identities");
    const query = signalDatabase.select().from(indentityTable).where(indentityTable.address.eq('-1'));
    query.exec().then(function (rows) {
        const pub = rows[0].public_key
        const priv = rows[0].private_key
        generateSignedPreKey(pub, priv)	
    });
}

function databaseConnect() {
    return signal.db.getSchemaBuilder().connect({
      storeType: lf.schema.DataStoreType.INDEXED_DB
    }).then(function(database) {
      signalDatabase = database;
      return Promise.resolve();
    });
}
