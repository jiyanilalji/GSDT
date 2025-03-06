// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title GSDT Stablecoin with Enhanced Security
 * @dev Implementation of the Global South Digital Token (GSDT) stablecoin with advanced security features
 */
contract GSDT is ERC20Pausable, AccessControl, ReentrancyGuard {
    using ECDSA for bytes32;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant KYC_VERIFIER_ROLE = keccak256("KYC_VERIFIER_ROLE");
    bytes32 public constant PRICE_UPDATER_ROLE = keccak256("PRICE_UPDATER_ROLE");

    // Events
    event Mint(address indexed to, uint256 amount);
    event Burn(address indexed from, uint256 amount);
    event PriceUpdate(uint256 newPrice);
    event RedemptionRequested(address indexed user, uint256 amount, uint256 requestId);
    event RedemptionProcessed(uint256 indexed requestId, bool approved);
    event KYCStatusUpdated(address indexed user, bool status, uint256 expiryTime);
    event KYCVerifierUpdated(address indexed verifier, bool status);
    event EmergencyShutdown(address indexed triggeredBy, uint256 timestamp);
    event SecurityLimitUpdated(string limitType, uint256 newValue);

    // Current price in USDC (6 decimals)
    uint256 public currentPrice;
    
    // Security limits
    uint256 public constant MIN_MINT_AMOUNT = 100 * 10**18; // 100 GSDT
    uint256 public constant MAX_MINT_AMOUNT = 1000000 * 10**18; // 1M GSDT
    uint256 public dailyMintLimit = 10000000 * 10**18; // 10M GSDT
    uint256 public dailyRedemptionLimit = 10000000 * 10**18; // 10M GSDT
    
    // Time-based restrictions
    uint256 public constant KYC_EXPIRY_PERIOD = 365 days;
    uint256 public constant REDEMPTION_DELAY = 24 hours;
    uint256 public constant EMERGENCY_COOLDOWN = 72 hours;
    
    // KYC and security mappings
    struct KYCData {
        bool approved;
        uint256 expiryTime;
        bytes32 verificationHash;
    }
    
    mapping(address => KYCData) public kycData;
    mapping(address => uint256) public dailyMintVolume;
    mapping(address => uint256) public dailyRedemptionVolume;
    mapping(address => uint256) public lastMintReset;
    mapping(address => uint256) public lastRedemptionReset;
    
    // Emergency shutdown
    bool public emergencyShutdown;
    uint256 public lastEmergencyAction;
    
    // Redemption request structure with enhanced security
    struct RedemptionRequest {
        address user;
        uint256 amount;
        uint256 timestamp;
        bool processed;
        bool approved;
        bytes32 requestHash;
    }
    
    mapping(uint256 => RedemptionRequest) public redemptionRequests;
    uint256 public nextRedemptionId;

    constructor() ERC20("Global South Digital Token", "GSDT") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(BURNER_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(KYC_VERIFIER_ROLE, msg.sender);
        _grantRole(PRICE_UPDATER_ROLE, msg.sender);
        
        currentPrice = 1_000000; // 1 USDC with 6 decimals
    }

    /**
     * @dev Updates KYC status with enhanced security
     * @param user Address of the user
     * @param status KYC approval status
     * @param verificationHash Hash of the KYC verification data
     */
    function updateKYCStatus(
        address user,
        bool status,
        bytes32 verificationHash
    ) external onlyRole(KYC_VERIFIER_ROLE) {
        require(user != address(0), "Invalid address");
        require(verificationHash != bytes32(0), "Invalid verification hash");
        
        uint256 expiryTime = status ? block.timestamp + KYC_EXPIRY_PERIOD : 0;
        
        kycData[user] = KYCData({
            approved: status,
            expiryTime: expiryTime,
            verificationHash: verificationHash
        });
        
        emit KYCStatusUpdated(user, status, expiryTime);
    }

    /**
     * @dev Verifies KYC status with expiry check
     * @param user Address to check
     */
    function verifyKYC(address user) public view returns (bool) {
        KYCData memory data = kycData[user];
        return data.approved && block.timestamp <= data.expiryTime;
    }

    /**
     * @dev Mints new tokens with enhanced security checks
     * @param to The address that will receive the minted tokens
     * @param amount The amount of tokens to mint
     */
    function mint(
        address to,
        uint256 amount
    ) external onlyRole(MINTER_ROLE) whenNotPaused nonReentrant {
        require(!emergencyShutdown, "Emergency shutdown active");
        require(to != address(0), "Invalid recipient");
        require(verifyKYC(to), "KYC verification failed or expired");
        require(amount >= MIN_MINT_AMOUNT, "Amount below minimum");
        require(amount <= MAX_MINT_AMOUNT, "Amount above maximum");
        
        // Reset daily limit if 24 hours have passed
        if (block.timestamp >= lastMintReset[to] + 24 hours) {
            dailyMintVolume[to] = 0;
            lastMintReset[to] = block.timestamp;
        }
        
        require(
            dailyMintVolume[to] + amount <= dailyMintLimit,
            "Daily mint limit exceeded"
        );
        
        dailyMintVolume[to] += amount;
        _mint(to, amount);
        emit Mint(to, amount);
    }

    /**
     * @dev Requests token redemption with enhanced security
     * @param amount Amount of tokens to redeem
     */
    function requestRedemption(
        uint256 amount
    ) external whenNotPaused nonReentrant {
        require(!emergencyShutdown, "Emergency shutdown active");
        require(verifyKYC(msg.sender), "KYC verification failed or expired");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        // Reset daily limit if 24 hours have passed
        if (block.timestamp >= lastRedemptionReset[msg.sender] + 24 hours) {
            dailyRedemptionVolume[msg.sender] = 0;
            lastRedemptionReset[msg.sender] = block.timestamp;
        }
        
        require(
            dailyRedemptionVolume[msg.sender] + amount <= dailyRedemptionLimit,
            "Daily redemption limit exceeded"
        );
        
        uint256 requestId = nextRedemptionId++;
        bytes32 requestHash = keccak256(
            abi.encodePacked(
                msg.sender,
                amount,
                block.timestamp,
                requestId
            )
        );
        
        redemptionRequests[requestId] = RedemptionRequest({
            user: msg.sender,
            amount: amount,
            timestamp: block.timestamp,
            processed: false,
            approved: false,
            requestHash: requestHash
        });
        
        dailyRedemptionVolume[msg.sender] += amount;
        emit RedemptionRequested(msg.sender, amount, requestId);
    }

    /**
     * @dev Processes redemption request with enhanced security
     * @param requestId ID of the redemption request
     * @param approved Whether the request is approved
     * @param signature Signature from authorized processor
     */
    function processRedemption(
        uint256 requestId,
        bool approved,
        bytes memory signature
    ) external onlyRole(BURNER_ROLE) nonReentrant {
        RedemptionRequest storage request = redemptionRequests[requestId];
        require(!request.processed, "Request already processed");
        require(
            request.timestamp + REDEMPTION_DELAY <= block.timestamp,
            "Redemption delay not met"
        );
        
        // Verify signature
        bytes32 messageHash = keccak256(
            abi.encodePacked(requestId, approved, request.requestHash)
        );
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();
        address signer = ethSignedMessageHash.recover(signature);
        require(hasRole(BURNER_ROLE, signer), "Invalid signature");
        
        request.processed = true;
        request.approved = approved;
        
        if (approved) {
            _burn(request.user, request.amount);
        }
        
        emit RedemptionProcessed(requestId, approved);
    }

    /**
     * @dev Updates token price
     * @param newPrice New token price in USDC (6 decimals)
     */
    function updatePrice(uint256 newPrice) external onlyRole(PRICE_UPDATER_ROLE) {
        require(newPrice > 0, "Invalid price");
        currentPrice = newPrice;
        emit PriceUpdate(newPrice);
    }

    /**
     * @dev Triggers emergency shutdown
     */
    function triggerEmergencyShutdown() external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(
            block.timestamp >= lastEmergencyAction + EMERGENCY_COOLDOWN,
            "Emergency cooldown active"
        );
        
        emergencyShutdown = true;
        lastEmergencyAction = block.timestamp;
        _pause();
        
        emit EmergencyShutdown(msg.sender, block.timestamp);
    }

    /**
     * @dev Updates security limits
     * @param newDailyMintLimit New daily mint limit
     * @param newDailyRedemptionLimit New daily redemption limit
     */
    function updateSecurityLimits(
        uint256 newDailyMintLimit,
        uint256 newDailyRedemptionLimit
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newDailyMintLimit > 0, "Invalid mint limit");
        require(newDailyRedemptionLimit > 0, "Invalid redemption limit");
        
        dailyMintLimit = newDailyMintLimit;
        dailyRedemptionLimit = newDailyRedemptionLimit;
        
        emit SecurityLimitUpdated("dailyMintLimit", newDailyMintLimit);
        emit SecurityLimitUpdated("dailyRedemptionLimit", newDailyRedemptionLimit);
    }

    /**
     * @dev Hook that is called before any transfer of tokens
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override {
        super._beforeTokenTransfer(from, to, amount);
        
        // Skip checks for minting and burning
        if (from != address(0) && to != address(0)) {
            require(!emergencyShutdown, "Emergency shutdown active");
            require(
                verifyKYC(from) && verifyKYC(to),
                "KYC verification failed or expired"
            );
        }
    }
}