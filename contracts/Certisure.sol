// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

contract Certisure is ERC721URIStorage, AccessControl {
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");

    uint256 private _nextTokenId;
    mapping(uint256 => bool) private _revoked;
    mapping(uint256 => bytes32) private _fileHash; // SHA-256 of the certificate file

    event CertificateMinted(uint256 indexed tokenId, address indexed to, address indexed issuer, string tokenURI, bytes32 fileHash);
    event CertificateRevoked(uint256 indexed tokenId, address indexed issuer);

    constructor(string memory name_, string memory symbol_) ERC721(name_, symbol_) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ISSUER_ROLE, msg.sender);
        _nextTokenId = 1;
    }

    function mintCertificate(address to, string calldata tokenUri, bytes32 fileHash) external onlyRole(ISSUER_ROLE) returns (uint256 tokenId) {
        tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenUri);
        _fileHash[tokenId] = fileHash;
        emit CertificateMinted(tokenId, to, msg.sender, tokenUri, fileHash);
    }

    function revoke(uint256 tokenId) external onlyRole(ISSUER_ROLE) {
        require(_ownerOf(tokenId) != address(0), "VeriVault: token does not exist");
        require(!_revoked[tokenId], "VeriVault: already revoked");
        _revoked[tokenId] = true;
        emit CertificateRevoked(tokenId, msg.sender);
    }

    function isRevoked(uint256 tokenId) external view returns (bool) {
        require(_ownerOf(tokenId) != address(0), "VeriVault: token does not exist");
        return _revoked[tokenId];
    }

    function fileHashOf(uint256 tokenId) external view returns (bytes32) {
        require(_ownerOf(tokenId) != address(0), "VeriVault: token does not exist");
        return _fileHash[tokenId];
    }

    function verify(uint256 tokenId) external view returns (address owner, string memory uri, bool revoked, bytes32 fileHash) {
        require(_ownerOf(tokenId) != address(0), "VeriVault: token does not exist");
        owner = ownerOf(tokenId);
        uri = tokenURI(tokenId);
        revoked = _revoked[tokenId];
        fileHash = _fileHash[tokenId];
    }

    function supportsInterface(bytes4 interfaceId) public view override(AccessControl, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
