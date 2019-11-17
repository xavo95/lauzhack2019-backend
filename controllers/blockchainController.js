'use strict';

require('dotenv').config();
var fs = require('fs');
var path = require("path");
var Web3 = require('web3');
var solc = require('solc');
var testRPC = require('ethereumjs-testrpc');
var mkdirp = require('mkdirp');
var SHA3 = require('sha3');


var contractsController = require('./dbController');
var logger = require('./../routes/utils/loggerfactory');


// Get all the config variables
var configTestRPCMnemonic = process.env.TESTRPCMNEMONIC;
var testRPCMnemonic = (configTestRPCMnemonic !== undefined ? configTestRPCMnemonic : 'dead fish racket soul plunger dirty boats cracker mammal nicholas cage');
var configTestRPCTotalAccounts = process.env.TESTRPCTOTALACCOUNTS;
var testRPCTotalAccounts = (configTestRPCTotalAccounts !== undefined ? configTestRPCTotalAccounts : 10);
var configTestRPCPath = process.env.TESTRPCPATH;
var testRPCPath = (configTestRPCPath !== undefined ? configTestRPCPath : 'testrpc_db');
var configTestRPCPort = process.env.TESTRPCPORT;
var testRPCPort = (configTestRPCPort !== undefined ? configTestRPCPort : 8545);

// Create the directory for blockchain persistency
mkdirp(path.join(process.cwd(), '/' + testRPCPath), function (err) {
    if (err) {
        logger.log('error', 'Errors happened while creating the directory: ' + err, 'controllers/blockchainController.js', 'root');
    }
    logger.log('info', 'Directory created successfully at ' + testRPCPath + ' !', 'controllers/blockchainController.js', 'root');
});

// Set up the provider and log the status
var web3 = new Web3(testRPC.provider({
    debug: true,
    mnemonic: testRPCMnemonic,
    total_accounts: testRPCTotalAccounts,
    unlocked_accounts: [0, 1, 2],
    db_path: testRPCPath,
    port: testRPCPort
}));
logger.log('info', 'Ethereum network configured correctly', 'controllers/blockchainController.js', 'root');


// Compile the source code
var input = fs.readFileSync('./contracts/StatusContract.sol');
var output = solc.compile(input.toString(), 1);
var bytecode = output.contracts[':StatusContract'].bytecode;
var abi = JSON.parse(output.contracts[':StatusContract'].interface);
var configStaticAddress = process.env.STATICADDRESS;
var STATIC_ADDRESS = (configStaticAddress !== undefined ? configStaticAddress : '0xc31eb6e317054a79bb5e442d686cb9b225670c1d');


/////////////////////////////////////////////////// PRIVATE METHODS ///////////////////////////////////////////////////
// Checks if the given string is an address
var isAddress = function (address) {
    if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
        // check if it has the basic requirements of an address
        return false;
    } else if (/^(0x)?[0-9a-f]{40}$/.test(address) || /^(0x)?[0-9A-F]{40}$/.test(address)) {
        // If it's all small caps or all all caps, return true
        return true;
    } else {
        // Otherwise check each case
        return isChecksumAddress(address);
    }
};

// Checks if the given string is a checksummed address
var isChecksumAddress = function (address) {
    // Check each case
    address = address.replace('0x', '');
    var d = new SHA3.SHA3Hash();
    d.update(address.toLowerCase());
    var addressHash = d.digest('hex');
    for (var i = 0; i < 40; i++) {
        // the nth letter should be uppercase if the nth digit of casemap is 1
        if ((parseInt(addressHash[i], 16) > 7 && address[i].toUpperCase() !== address[i]) || (parseInt(addressHash[i], 16) <= 7 && address[i].toLowerCase() !== address[i])) {
            return false;
        }
    }
    return true;
};


/////////////////////////////////////////////////// PUBLIC METHODS ///////////////////////////////////////////////////

// Function that generates a new contract and saves his address onto the database with the status as reference
var generateNewContract = function (callback, status) {
    // Contract object
    var contract = new web3.eth.Contract(abi);
    contract.options.from = STATIC_ADDRESS;
    contract.options.gasPrice = '2000000000';
    contract.options.gas = 90000 * 2;
    contract.options.data = '0x' + bytecode;

    contract.deploy({
        arguments: ['Default Contract', status]
    }).send({
        from: STATIC_ADDRESS,
        gas: 1500000,
        gasPrice: '2000000000'
    }, function (error, transactionHash) {
    }).on('error', function (error) {
        logger.log('error', error, 'routes/blockchainroute/blockchain.js', 'root');
    }).on('transactionHash', function (transactionHash) {
        logger.log('info', 'New transaction, transaction hash: ' + transactionHash, 'routes/blockchainroute/blockchain.js', 'root');
    }).on('receipt', function (receipt) {
        logger.log('info', 'Receipt received, new contract address: ' + receipt.contractAddress, 'routes/blockchainroute/blockchain.js', 'root');
    }).on('confirmation', function (confirmationNumber, receipt) {
    }).then(function (newContractInstance) {
        newContractInstance.methods.getContractAddress().call(function (error, address) {
            if (error) {
                return callback(error)
            } else {
                contractsController.addContract(callback, status);
            }
        });
    });
};

// Function to get all contracts
var getAllContracts = function (callback) {
    contractsController.getContracts(callback);
};


////////////////////////////////////////////////////// EXPORTS //////////////////////////////////////////////////////


module.exports.generateNewContract = generateNewContract;
module.exports.getAllContracts = getAllContracts;