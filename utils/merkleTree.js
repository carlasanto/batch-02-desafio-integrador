const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");
const { ethers } = require("hardhat");
const walletList = require("../wallets/walletList");
const { Buffer } = require("buffer");



console.log("walletList:", walletList);
// Función para convertir una cadena hexadecimal en Buffer
function hexToBuffer(hexString) {
  return Buffer.from(hexString, "hex");
}

function hashToken(tokenId, address, privateKey) {
  if (privateKey) {
    // Codifica los datos manualmente
    const tokenIdBuffer = uint256ToBuffer(tokenId);
    const addressBuffer = hexToBuffer(address.slice(2));
    const privateKeyBuffer = hexToBuffer(privateKey.slice(2));

    // Combina los buffers
    const data = Buffer.concat([tokenIdBuffer, addressBuffer, privateKeyBuffer]);
  
      // Calcula el hash manualmente
      const hashBuffer = keccak256(data);
      return hashBuffer;
    } else {
      // Ajusta este bloque según tus datos
      const addressBuffer = hexToBuffer(address.slice(2));
      const hashBuffer = keccak256(addressBuffer);
      return hashBuffer;
    }
  }
  function uint256ToBuffer(value) {
    const buffer = Buffer.alloc(32);
    buffer.writeUInt32BE(value, 28);
    return buffer;
  }
  
  
  

function calculateMerkleRoot() {
  const elements = walletList.map((wallet) => {
    const { id, address, privateKey } = wallet;
    const hashBuffer = hashToken(id, address, privateKey);
    return hashBuffer;
    
      
  });

  const merkleTree = new MerkleTree(elements, keccak256, { sortPairs: true });
  const root = merkleTree.getRoot().toString("hex");

  return root;
}


 

module.exports = { calculateMerkleRoot, hashToken };









