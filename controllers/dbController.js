'use strict';

var Contracts = require('../models/contractModel');


/////////////////////////////////////////////////// PUBLIC METHODS ///////////////////////////////////////////////////


// Function to add the contract address into the db
var addContract = function (callback, status) {
    var contract = new Contracts({
        status: status
    });
    contract.save(function (err) {
        callback(err);
    });
};

// Function to get the list of all contracts in the DB
var getContracts = function (callback) {
    Contracts.find({}, function (err, contracts) {
        callback(err, contracts);
    });
};

// Function to get the contract by the status
var getContractByStatus = function (callback, status) {
    Contracts.findOne({status: status}, function (err, contracts) {
        callback(err, contracts);
    });
};


////////////////////////////////////////////////////// EXPORTS //////////////////////////////////////////////////////


module.exports.addContract = addContract;
module.exports.getContracts = getContracts;
module.exports.getContractByStatus = getContractByStatus;