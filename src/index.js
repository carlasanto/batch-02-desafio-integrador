import {Contract, ethers } from "ethers";
//const { ethers } = require('ethers');

import usdcTknAbi from "../artifacts/contracts/USDCoin.sol/USDCoin.json";
import bbitesTokenAbi from "../artifacts/contracts/BBitesToken.sol/BBitesToken.json";
import publicSaleAbi from "../artifacts/contracts/PublicSale.sol/PublicSale.json";
import nftTokenAbi from "../artifacts/contracts/CuyCollectionNft.sol/CuyCollectionNft.json";

// SUGERENCIA: vuelve a armar el MerkleTree en frontend
// Utiliza la libreria buffer
import buffer from "buffer/";
import walletAndIds from "../wallets/walletList";
import { MerkleTree } from "merkletreejs";

var Buffer = buffer.Buffer;
var merkleTree;



function hashToken(tokenId, account) {
  return Buffer.from(
    ethers
    .solidityPackedKeccak256(["uint256", "address"], [tokenId, account])
      .slice(2),
    "hex"
  );
}
function buildMerkleTree() {
  var elementosHasheados= walletAndIds.map(({id, address})=> {
    return hashToken(id, address);
  });
  merkleTree = new MerkleTree(elementosHasheados, ethers.keccak256, {
    sortPairs: true,
  });
}

var provider, signer, account;
var usdcTkContract, bbitesTknContract, pubSContract, nftContract;
var usdcAddress, bbitesTknAdd, pubSContractAdd;

function initSCsGoerli() {
  try {
    provider = new ethers.BrowserProvider(window.ethereum);

    usdcAddress = "0xA05E7Aee813327cA8010eea4050Fc5104A328627";
    bbitesTknAdd = "0x9232C19e0C1f000ed40dC17e36e9d03D42fAaC2A";
    pubSContractAdd = "0x1a976387c94f46f187124f2b2b2dd2a62f3b7c5f";

    usdcTkContract = new Contract(usdcAddress, usdcTknAbi.abi, provider);
    bbitesTknContract = new Contract(bbitesTknAdd, bbitesTokenAbi.abi, provider);
    pubSContract = new Contract(pubSContractAdd, publicSaleAbi.abi, provider);
  } catch (error) {
    console.error("Error al inicializar los contratos en la red Goerli:", error);
  }
}

function initSCsMumbai() {
  try {
    provider = new ethers.BrowserProvider(window.ethereum);

    var nftAddress = "0x4d610d92e769Dae9eB2BF2e1899471C8bB1c754d";

    nftContract = new Contract(nftAddress, nftTokenAbi.abi, provider); // Está bien?
  } catch (error) {
    console.error("Error al inicializar los contratos en la red Mumbai:", error);
  }
}

async function setUpListeners() {
  // Connect to Metamask
  var bttn = document.getElementById("connect");
  var walletIdEl = document.getElementById("walletId");
  bttn.addEventListener("click", async function () {
    if (window.ethereum) {    // validamos metamask
      
      [account] = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Conectado con Metamask, cuenta: ", account);
      walletIdEl.innerHTML = "Conectado con cuenta: " + account;

      //provider = new ethers.BrowserProvider(window.ethereum)
      signer = await provider.getSigner(account);
    } 
  });

  // USDC Balance - balanceOf

  var bttn = document.getElementById("usdcUpdate");
  bttn.addEventListener("click", async function () {
    var balance = await usdcTkContract.balanceOf(account);
    var balanceEl = document.getElementById("usdcBalance");
    balanceEl.innerHTML = ethers.formatUnits(balance, 6);
  });

  // Bbites token Balance - balanceOf
  var bttnBbites = document.getElementById("bbitesTknUpdate");
  bttnBbites.addEventListener("click", async function () {
    var balance = await bbitesTknContract.balanceOf(account);
    
    var balanceEl = document.getElementById("bbitesTknBalance");
    balanceEl.innerHTML = ethers.formatUnits(balance, 18);
  });

  var usdcMint = document.getElementById('usdcMintBtn');
  usdcMint.addEventListener('click', async function() {
    await usdcTkContract.connect(signer).mint(account, 30_000 * 1e6)
  })

  var bbitesMint = document.getElementById('bbitesTknMintBtn');
  bbitesMint.addEventListener('click', async function() {
    await bbitesTknContract.connect(signer).mint(account, ethers.parseEther("100000"))
  })

  // APPROVE BBTKN
  // bbitesTknContract.approve
  var bttnApproveBBTkn = document.getElementById("approveButtonBBTkn");
  bttnApproveBBTkn.addEventListener('click', async () => {
    try {
      var value = document.getElementById("approveInput").value
      await bbitesTknContract.connect(signer).approve(pubSContractAdd, ethers.parseUnits(value, 18))
    } catch(error) {
      document.getElementById('approveError').innerHTML = error.reason
      console.error(error.reason)
    }
  });

  // APPROVE USDC
  // usdcTkContract.approve
  var bttnApproveUsdc = document.getElementById("approveButtonUSDC");
  bttnApproveUsdc.addEventListener('click', async () => {
    try {
      var value = document.getElementById("approveInputUSDC").value
      await usdcTkContract.connect(signer).approve(pubSContractAdd, ethers.parseUnits(value, 6))
    } catch(error) {
      document.getElementById('approveErrorUSDC').innerHTML = error.reason
      console.error(error.reason)
    }
    
  });

  // purchaseWithTokens
  var bttnPurchaseWithBbites = document.getElementById("purchaseButton");
  //var idInput = document.getElementById("purchaseInput");
  bttnPurchaseWithBbites.addEventListener("click", async () => {
    var id = document.getElementById('purchaseInput').value
    try {
      const tx = await pubSContract
        .connect(signer)
        .purchaseWithTokens(id);
      const res = await tx.wait();
      console.log(res.hash)
    } catch(error) {
      document.getElementById('purchaseError').innerHTML = error.reason
      console.error(error.reason)
    }
    
  });
  // purchaseWithUSDC
  var bttnPurchaseWithUSDC = document.getElementById("purchaseButtonUSDC");
  bttnPurchaseWithUSDC.addEventListener('click', async () => {
    var id = document.getElementById('purchaseInputUSDC').value
    var amountIn = document.getElementById('amountInUSDCInput').value
    try { 
      await pubSContract.connect(signer).purchaseWithUSDC(id, ethers.parseUnits(amountIn, 6))
    } catch(error) {
      document.getElementById('purchaseErrorUSDC').innerHTML = error.reason
      console.error(error.reason)
    }
  });
  // purchaseWithEtherAndId
  var bttnPurchaseWithEtherAndId = document.getElementById("purchaseButtonEtherId");
  bttnPurchaseWithEtherAndId.addEventListener('click', async () => {
    var id = document.getElementById('purchaseInputEtherId').value
    try {
      await pubSContract.connect(signer).purchaseWithEtherAndId(id, {value: ethers.parseUnits('0.01', 18)})
    } catch(error) {
      document.getElementById('purchaseEtherIdError').innerHTML = error.reason
      console.error(error.reason)
    }
  });

  // send Ether
  var bttn = document.getElementById("sendEtherButton");
  bttn.addEventListener("click", async () => {
    try {
      await pubSContract.connect(signer).depositEthForARandomNft({value: ethers.parseUnits('0.01', 18)})
    } catch(error) {
      document.getElementById('sendEtherError').innerHTML = error.reason
      console.error(error.reason)
    }
  });
  // getPriceForId
  var bttn = document.getElementById("getPriceNftByIdBttn");
  //var inputId = document.getElementById("priceNftIdInput");
  bttn.addEventListener("click", async () => {
    var id = document.getElementById('priceNftIdInput').value
    try {
      const price = await pubSContract.getPriceForId(id)
      document.getElementById('priceNftByIdText').innerHTML = ethers.formatUnits(price)
    } catch(error) {
      document.getElementById('getPriceNftError').innerHTML = error.reason
      console.error(error.reason)
    }
  });
  // getProofs
  var getProofsButtonId = document.getElementById("getProofsButtonId");
  bttn.addEventListener("click", async () => {
    var id = document.getElementById("inputIdProofId").value;
    var address = document.getElementById("inputAccountProofId").value;
    var proofs = merkleTree.getHexProof(hashToken(id, address));
    document.getElementById('showProofsTextId').innerHTML = JSON.stringify(proofs)
    navigator.clipboard.writeText(JSON.stringify(proofs));
  });

  // safeMintWhiteList
  var bttn = document.getElementById("safeMintWhiteListBttnId");
  bttn.addEventListener("click", async () => {
    try {
      var proofsValue = document.getElementById("whiteListToInputProofsId").value;
      var to = document.getElementById('whiteListToInputId').value
      var tokenId = document.getElementById('whiteListToInputTokenId').value
      proofsValue = JSON.parse(proofsValue).map(ethers.hexlify);
      await nftContract.connect(signer).safeMintWhiteList(to, tokenId, proofsValue)
    } catch(error) {
      document.getElementById('whiteListErrorId').innerHTML = error.reason
      console.error(error.reason)
    }
  });

  // buyBack
  var bttn = document.getElementById("buyBackBttn");
  bttn.addEventListener("click", async () => {
    // Agregar aquí la lógica para buyBack
    try {
      var id = document.getElementById('buyBackInputId').value
      await nftContract.connect(signer).buyBack(id)
    } catch(error) {
      document.getElementById('buyBackErrorId').innerHTML = error.reason
      console.error(error.reason)
    }
  });
}

function setUpEventsContracts() {
  var pubSList = document.getElementById("pubSList");
   pubSContract.on("PurchaseNftWithId",(account, id) => {
    const node = document.createElement("p")
    const textNode = document.createTextNode(`Owner ${owner} Id ${id}`)
    node.appendChild(textNode)
    pubSList.appendChild(node);
  });

  var nftList = document.getElementById("nftList");
  // nftCListener - "Transfer"
  nftContract.on("Transfer", (from, to, id) => {
    console.log("Find Transfer Event")
    const node = document.createElement("p")
    const textNode = document.createTextNode(`From ${from} To ${to} Token Id ${id}`)
    node.appendChild(textNode)
    nftList.appendChild(node);
  })
  
  var burnList = document.getElementById("burnList");
  // nftCListener - "Burn"
  nftContract.on("Burn", (account,id) => {
    const node = document.createElement("p")
    const textNode = document.createTextNode(`From ${account} Token Id ${id}`)
    node.appendChild(textNode)
    burnList.appendChild(node);
  })

  
  
}

async function setUp() {
  window.ethereum.on("chainChanged", (chainId) => {
    window.location.reload();
  });

  
    initSCsGoerli();
    initSCsMumbai();
    
    await setUpListeners();
    setUpEventsContracts();
    buildMerkleTree();
    
  } 

  


  setUp()
    .then()
    .catch((e) => console.log(e));
