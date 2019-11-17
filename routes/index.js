'use strict';

var express = require('express');
var router = express.Router();
var blockchainRouter = require('./blockchainroute/blockchain');


/////////////////////////////////////////////////// ROUTER MAPPING ///////////////////////////////////////////////////

router.get('/example', blockchainRouter.mapIndex);
router.get('/generate_new_contract/:status', blockchainRouter.generateNewContract);
router.get('/get_all_contracts', blockchainRouter.getAllContracts);

////////////////////////////////////////////////////// EXPORTS //////////////////////////////////////////////////////


module.exports.router = router;
