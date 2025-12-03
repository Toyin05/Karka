// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title Karka Identity Protection Smart Contract
 * @dev Manages immutable identity hashes, updates, verification, social handles, and violation logging for the KARKA platform.
 * Integrates with CAMP Network for blockchain-verified identity protection.
 */
contract KarkaIdentityProtection {
    // Struct to hold user identity information
    struct UserIdentity {
        bytes32 identityHash;  // Hash of the user's identity bundle
        uint256 timestamp;     // Timestamp of registration or last update
        bool isActive;         // Whether the identity is active (not revoked)
    }

    // Mapping from user address to their identity
    mapping(address => UserIdentity) public identities;

    // Mapping for social handles: user => handleType => hashedHandle
    mapping(address => mapping(string => bytes32)) public handles;

    // Events for indexing and off-chain tracking
    event IdentityRegistered(address indexed user, bytes32 identityHash, uint256 timestamp);
    event IdentityUpdated(address indexed user, bytes32 newHash, uint256 timestamp);
    event IdentityRevoked(address indexed user, uint256 timestamp);
    event HandleAdded(address indexed user, string handleType, bytes32 hashedHandle);
    event HandleRemoved(address indexed user, string handleType);
    event ViolationLogged(address indexed user, bytes32 violationId, uint256 timestamp);

    /**
     * @dev Registers a new identity hash for the caller.
     * Prevents duplicate active registrations.
     * @param _identityHash The hash of the user's identity bundle.
     */
    function registerIdentity(bytes32 _identityHash) external {
        require(identities[msg.sender].timestamp == 0 || !identities[msg.sender].isActive, "Identity already registered and active");
        identities[msg.sender] = UserIdentity(_identityHash, block.timestamp, true);
        emit IdentityRegistered(msg.sender, _identityHash, block.timestamp);
    }

    /**
     * @dev Updates the identity hash for the caller (rotation).
     * Only allowed if identity is active.
     * @param _newHash The new identity hash.
     */
    function updateIdentity(bytes32 _newHash) external {
        require(identities[msg.sender].isActive, "Identity not active");
        identities[msg.sender].identityHash = _newHash;
        identities[msg.sender].timestamp = block.timestamp;
        emit IdentityUpdated(msg.sender, _newHash, block.timestamp);
    }

    /**
     * @dev Verifies if a provided hash matches the registered identity hash for a user.
     * Used by third parties for proof of ownership.
     * @param _user The user address to verify.
     * @param _providedHash The hash to check against.
     * @return True if the hash matches and identity is active.
     */
    function verifyIdentity(address _user, bytes32 _providedHash) external view returns (bool) {
        return identities[_user].isActive && identities[_user].identityHash == _providedHash;
    }

    /**
     * @dev Revokes the caller's identity, disabling monitoring and access.
     */
    function revokeIdentity() external {
        require(identities[msg.sender].isActive, "Identity not active");
        identities[msg.sender].isActive = false;
        emit IdentityRevoked(msg.sender, block.timestamp);
    }

    /**
     * @dev Adds or updates a social handle for the caller.
     * @param _handleType The type of handle (e.g., "TikTok", "Instagram").
     * @param _hashedHandle The hashed version of the handle.
     */
    function addHandle(string memory _handleType, bytes32 _hashedHandle) external {
        require(identities[msg.sender].isActive, "Identity not active");
        handles[msg.sender][_handleType] = _hashedHandle;
        emit HandleAdded(msg.sender, _handleType, _hashedHandle);
    }

    /**
     * @dev Removes a social handle for the caller.
     * @param _handleType The type of handle to remove.
     */
    function removeHandle(string memory _handleType) external {
        require(handles[msg.sender][_handleType] != bytes32(0), "Handle not set");
        delete handles[msg.sender][_handleType];
        emit HandleRemoved(msg.sender, _handleType);
    }

    /**
     * @dev Logs a violation for the caller (hybrid on-chain/off-chain).
     * Emits an event for indexing; actual violation details stored off-chain.
     * @param _violationId Hashed ID of the violation.
     */
    function logViolation(bytes32 _violationId) external {
        require(identities[msg.sender].isActive, "Identity not active");
        emit ViolationLogged(msg.sender, _violationId, block.timestamp);
    }

    /**
     * @dev Retrieves the identity information for a user.
     * @param _user The user address.
     * @return The UserIdentity struct.
     */
    function getIdentity(address _user) external view returns (UserIdentity memory) {
        return identities[_user];
    }

    /**
     * @dev Retrieves a hashed handle for a user and handle type.
     * @param _user The user address.
     * @param _handleType The handle type.
     * @return The hashed handle.
     */
    function getHandle(address _user, string memory _handleType) external view returns (bytes32) {
        return handles[_user][_handleType];
    }
}