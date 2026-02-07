// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Escrow Contract
 * @dev A simple escrow contract for holding funds until conditions are met
 */
contract Escrow {
    struct EscrowData {
        address buyer;
        address seller;
        address arbiter;
        uint256 amount;
        bool funded;
        bool released;
        bool refunded;
        bool disputed;
        uint256 createdAt;
        uint256 fundedAt;
    }

    mapping(uint256 => EscrowData) public escrows;
    uint256 public escrowCount;
    address public owner;

    event EscrowCreated(uint256 indexed escrowId, address indexed buyer, address indexed seller, address arbiter, uint256 amount);
    event EscrowFunded(uint256 indexed escrowId, address indexed buyer, uint256 amount);
    event EscrowReleased(uint256 indexed escrowId, address indexed seller, uint256 amount);
    event EscrowRefunded(uint256 indexed escrowId, address indexed buyer, uint256 amount);
    event DisputeFiled(uint256 indexed escrowId, address indexed filer);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier onlyParties(uint256 escrowId) {
        EscrowData storage escrow = escrows[escrowId];
        require(
            msg.sender == escrow.buyer || 
            msg.sender == escrow.seller || 
            msg.sender == escrow.arbiter,
            "Not authorized"
        );
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Create a new escrow
     */
    function createEscrow(
        address _seller,
        address _arbiter
    ) external payable returns (uint256) {
        require(_seller != address(0), "Invalid seller address");
        require(_arbiter != address(0), "Invalid arbiter address");
        require(_seller != msg.sender, "Seller cannot be buyer");
        require(_arbiter != msg.sender && _arbiter != _seller, "Invalid arbiter");

        escrowCount++;
        escrows[escrowCount] = EscrowData({
            buyer: msg.sender,
            seller: _seller,
            arbiter: _arbiter,
            amount: msg.value,
            funded: msg.value > 0,
            released: false,
            refunded: false,
            disputed: false,
            createdAt: block.timestamp,
            fundedAt: msg.value > 0 ? block.timestamp : 0
        });

        if (msg.value > 0) {
            emit EscrowFunded(escrowCount, msg.sender, msg.value);
        }

        emit EscrowCreated(escrowCount, msg.sender, _seller, _arbiter, msg.value);
        return escrowCount;
    }

    /**
     * @dev Fund an existing escrow
     */
    function fundEscrow(uint256 escrowId) external payable {
        EscrowData storage escrow = escrows[escrowId];
        require(escrow.buyer == msg.sender, "Only buyer can fund");
        require(!escrow.funded, "Escrow already funded");
        require(msg.value > 0, "Must send ETH");

        escrow.funded = true;
        escrow.amount = msg.value;
        escrow.fundedAt = block.timestamp;

        emit EscrowFunded(escrowId, msg.sender, msg.value);
    }

    /**
     * @dev Release funds to seller (buyer or arbiter can call)
     */
    function releaseEscrow(uint256 escrowId) external {
        EscrowData storage escrow = escrows[escrowId];
        require(escrow.funded, "Escrow not funded");
        require(!escrow.released && !escrow.refunded, "Escrow already completed");
        require(
            msg.sender == escrow.buyer || msg.sender == escrow.arbiter,
            "Only buyer or arbiter can release"
        );

        escrow.released = true;
        (bool success, ) = escrow.seller.call{value: escrow.amount}("");
        require(success, "Transfer failed");

        emit EscrowReleased(escrowId, escrow.seller, escrow.amount);
    }

    /**
     * @dev Refund funds to buyer (buyer or arbiter can call)
     */
    function refundEscrow(uint256 escrowId) external {
        EscrowData storage escrow = escrows[escrowId];
        require(escrow.funded, "Escrow not funded");
        require(!escrow.released && !escrow.refunded, "Escrow already completed");
        require(
            msg.sender == escrow.buyer || msg.sender == escrow.arbiter,
            "Only buyer or arbiter can refund"
        );

        escrow.refunded = true;
        (bool success, ) = escrow.buyer.call{value: escrow.amount}("");
        require(success, "Transfer failed");

        emit EscrowRefunded(escrowId, escrow.buyer, escrow.amount);
    }

    /**
     * @dev File a dispute (buyer or seller can call)
     */
    function fileDispute(uint256 escrowId) external {
        EscrowData storage escrow = escrows[escrowId];
        require(escrow.funded, "Escrow must be funded");
        require(
            msg.sender == escrow.buyer || msg.sender == escrow.seller,
            "Only buyer or seller can file dispute"
        );

        escrow.disputed = true;
        emit DisputeFiled(escrowId, msg.sender);
    }

    /**
     * @dev Get escrow details
     */
    function getEscrow(uint256 escrowId) external view returns (EscrowData memory) {
        return escrows[escrowId];
    }

    /**
     * @dev Get escrow status
     */
    function getEscrowStatus(uint256 escrowId) external view returns (
        bool funded,
        bool released,
        bool refunded,
        bool disputed
    ) {
        EscrowData storage escrow = escrows[escrowId];
        return (escrow.funded, escrow.released, escrow.refunded, escrow.disputed);
    }
}

