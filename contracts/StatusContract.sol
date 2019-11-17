pragma solidity ^0.4.17;


contract StatusContract {
    address creator;
    string statusContractName;
    string status;

    function StatusContract(string _statusContractName, string _status) public {
        creator = msg.sender;
        statusContractName = _statusContractName;
        status = _status;
    }

    function getStatusName() public constant returns (string) {
        return statusContractName;
    }

    function getContractAddress() public constant returns (address) {
        return this;
    }

    function getStatus() public constant returns (string) {
        return status;
    }

    function setStatus(string _status) private {
        status = _status;
    }

    function kill() public {
        if (msg.sender == creator)
        selfdestruct(creator);
    }
}