
// add underscore string as mixin
_.mixin(s);

// set providor
if(!web3.currentProvider)
    web3.setProvider(new web3.providers.HttpProvider("http://localhost:8545"))
