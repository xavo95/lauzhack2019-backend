'use strict';

var blockchainController = require('./../../controllers/blockchainController');
var logger = require('./../utils/loggerfactory');


/////////////////////////////////////////////////// PRIVATE METHODS ///////////////////////////////////////////////////


/////////////////////////////////////////////////// PUBLIC METHODS ///////////////////////////////////////////////////


// Function to make example test
var mapIndex = function (req, res) {
    logger.log('info', 'Blockchain Implementation', 'routes/blockchainroute/blockchain.js', 'mapIndex');
    return res.status(200).send({'msg': 'Blockchain Implementation'});
};

// Function to generate a new contract, takes status as body parameter
var generateNewContract = function (req, res) {
    var status = req.params.status;
    if (status === null || status === undefined || status === '') {
        logger.log('error', 'Invalid status', 'routes/blockchainroute/blockchain.js', 'generateNewContract');
        return res.status(503).send({message: 'Invalid status'});
    } else {
        var callback = function (err) {
            if (err) {
                logger.log('error', 'Error performing the query: ' + err, 'routes/blockchainroute/blockchain.js', 'generateNewContract');
                return res.status(503).send({message: 'Error performing the query: ' + err});
            } else {
                logger.log('info', 'Contract added successfully', 'routes/blockchainroute/blockchain.js', 'generateNewContract');
                return res.status(200).send({message: 'Contract added successfully'});
            }
        };
        blockchainController.generateNewContract(callback, status);
    }
};

// Function to get all contracts
var getAllContracts = function (req, res) {
    var callback = function (err, contracts) {
        if (err) {
            logger.log('error', 'Error performing the query: ' + err, 'routes/blockchainroute/blockchain.js', 'getAllContracts');
            return res.status(503).send({message: 'Error performing the query: ' + err});
        } else if (!contracts) {
            logger.log('error', 'There is no contracts on database', 'routes/blockchainroute/blockchain.js', 'getAllContracts');
            return res.status(404).send({message: 'There is no contracts on database'});
        } else if (contracts.length === 0) {
            logger.log('error', 'There is no contracts on database', 'routes/blockchainroute/blockchain.js', 'getAllContracts');
            return res.status(404).send({message: 'There is no contracts on database'});
        } else {
            logger.log('info', 'Contracts retrieved successfully', 'routes/blockchainroute/blockchain.js', 'getAllContracts');
            return res.status(200).send(contracts);
        }
    };
    blockchainController.getAllContracts(callback);
};

////////////////////////////////////////////////////// EXPORTS //////////////////////////////////////////////////////


module.exports.mapIndex = mapIndex;
module.exports.generateNewContract = generateNewContract;
module.exports.getAllContracts = getAllContracts;