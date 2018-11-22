
const go = new Go();
let mod, inst;
var signalDatabase = null;
databaseConnect()
WebAssembly.instantiateStreaming(fetch("libsignal.wasm"), go.importObject).then(async (result) => {
    mod = result.module;
    inst = result.instance;
    await go.run(inst)
});

function getIdentityKeyPair() {
    k = getIdentityKeyPairFromGo()
    const identityTable = signalDatabase.getSchema().table("identities");
    const row = identityTable.createRow({
      address: "-1",
      registration_id: k.regId,
      public_key: k.pub,
      private_key: k.priv
    });

    signalDatabase.insertOrReplace()
      .into(identityTable)
      .values([row])
      .exec()
      .then(function(rows) {});
}

function getIdentityKeyPairCallback(pub, priv, regId) {

}

function getIdentityKeyFromStore(address) {
    const identityTable = signalDatabase.getSchema().table("identities");
    const query = signalDatabase.select().from(identityTable).where(identityTable.address.eq(address));
    return query.exec().then(function (rows) {
        if (rows.length == 1) {
            return JSON.stringify(rows[0])
        }
    });
}

function generatePreKeys() {
    const preKeysStr = generatePreKeysFromGo(1, 100)
    const preKeys = preKeysStr.split(","); 
    const preKeysTable = signalDatabase.getSchema().table("prekeys");
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

function generateSignedPreKey() {
    const identityTable = signalDatabase.getSchema().table("identities");
    const signedPreKeyTable = signalDatabase.getSchema().table("signed_prekeys"); 
    const query = signalDatabase.select().from(identityTable).where(identityTable.address.eq('-1'));
    query.exec().then(function (rows) {
        const pub = rows[0].public_key
        const priv = rows[0].private_key
        result = generateSignedPreKeyFromGo(pub, priv)	
        const row = signedPreKeyTable.createRow({
            prekey_id: result.id,
            record: result.record
        });
        signalDatabase.insert().into(signedPreKeyTable).values([row]).exec()
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
