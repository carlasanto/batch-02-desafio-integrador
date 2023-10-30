// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract CuyCollectionNft is Initializable, ERC721Upgradeable, PausableUpgradeable, AccessControlUpgradeable, ERC721BurnableUpgradeable, UUPSUpgradeable {
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    bytes32 public root;

    event Burn(address account, uint256 id);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() initializer public {
        __ERC721_init("CuyCollectionNft", "CUYNFT");
        __Pausable_init();
        __AccessControl_init();
        __ERC721Burnable_init();
        __UUPSUpgradeable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(UPGRADER_ROLE, msg.sender);
    }

    function _baseURI() internal pure override returns (string memory) {
        // Devuelve la URL base para los metadatos de los NFTs
        return "ipfs://QmfDR3uXdQDgqH6bxUSfxHgCXeLSTHNGiU1EmhbbEhRLEc/";
    }

    function safeMint(
        address to,
        uint256 tokenId
    ) public onlyRole(MINTER_ROLE) whenNotPaused {
        // Permite al creador de tokens crear NFTs y asignarlos a direcciones específicas
        require(tokenId >= 0 && tokenId <= 999, "Token ID fuera de rango");
        _safeMint(to, tokenId);
    }

    function safeMintWhiteList(
        address to,
        uint256 tokenId,
        bytes32[] calldata proofs
    ) public whenNotPaused {
        // Permite la creación de NFTs solo para usuarios específicos mediante una lista blanca
        require(
            verify(_hashearInfo(to, tokenId), proofs),
            "No te encuentras en la lista"
        );
        _safeMint(to, tokenId);
    }

    function _hashearInfo(
        address to,
        uint256 tokenId
    ) public pure returns (bytes32) {
        // Crea un hash único basado en la dirección y el ID del token
        return keccak256(abi.encodePacked(tokenId, to));
    }

    function verify(
        bytes32 leaf,
        bytes32[] memory proofs
    ) public view returns (bool) {
        // Verifica si un hash existe en un conjunto de pruebas de Merkle
        return MerkleProof.verify(proofs, root, leaf);
    }

    function updateRoot(bytes32 _root) public onlyRole(DEFAULT_ADMIN_ROLE) {
        // Permite al administrador actualizar la raíz del árbol Merkle utilizado para verificar la lista blanca de NFTs
        root = _root;
    }

    function buyBack(uint256 id) public {
        // Permite a los usuarios comprar de nuevo un NFT con un ID en un rango específico y quemar el NFT existente
        require(id >= 1000 && id <= 1999, "Buyback no es posible");
        burn(id);
        emit Burn(msg.sender, id);
    }

    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize)
        internal
        whenNotPaused
        override
    {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        onlyRole(UPGRADER_ROLE)
        override
    {}

    // The following functions are overrides required by Solidity.
    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721Upgradeable, AccessControlUpgradeable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}

