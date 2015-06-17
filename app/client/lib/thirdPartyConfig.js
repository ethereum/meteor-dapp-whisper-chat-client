
// add underscore string as mixin
_.mixin(s);

// set providor
if(!web3.currentProvidor)
    web3.setProvider(new web3.providers.HttpProvider("http://localhost:8545"))
