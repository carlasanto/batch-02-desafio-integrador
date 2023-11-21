require("dotenv").config();

const {
  getRole,
  verify,
  ex,
  printAddress,
  deploySC,
  deploySCNoUp,
} = require("../utils");

const { getRootFromMT } = require("../utils/merkleTree");

var MINTER_ROLE = getRole("MINTER_ROLE");
var BURNER_ROLE = getRole("BURNER_ROLE");

// Publicar NFT en Mumbai
async function deployMumbai() {

  
  
  var relAddMumbai= "0x72BF9B33447B7E8752e91ACc60Ac269880DEf89D"; // relayer mumbai
  var name = "CuyCollectionNft";
  var symbol = "CUYNFT";
  // utiliza deploySC
  var proxyContract = await deploySC("CuyCollectionNft", [name, symbol]);
  var proxyContractAdd = await proxyContract.getAddress();
  // utiliza printAddress
  var implementationAddressNft = await printAddress("CuyCollectionNft",proxyContractAdd);

   //utiliza ex
  await ex(proxyContract,"updateRoot",[getRootFromMT()], "Failed");

  // utiliza ex
  await ex(proxyContract,"grantRole",[MINTER_ROLE, relAddMumbai], "Failed");


  // utiliza verify
  await verify(implementationAddressNft, "CuyCollectionNft",[]);
  
}


var uniSwap = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
// Publicar UDSC, Public Sale y Bbites Token en Goerli

async function deployGoerli() {
  var relAddGoerli= "0x7B013F3b6b3d32cBC1ADfAE7341d8ceA7e3E9b22"; // relayer goerli
  // var psC Contrato
  // deploySC;
  // var bbitesToken Contrato

  var proxCoBBites = await deploySC("BBitesToken",[]);
  var proxyAddBBites = await proxCoBBites.getAddress();
  var impAddBBitesToken = await printAddress("BBitesToken", proxyAddBBites);
  await ex(proxCoBBites, "grantRole",[MINTER_ROLE, relAddGoerli], "Failed");
  await verify(impAddBBitesToken, "BBitesToken", []);

  // deploySC;
  var smartContractUsdc = await deploySCNoUp("USDCoin", []);
  var usdcAddress = await smartContractUsdc.getAddress();
  console.log(`Adress contrato USDC ${usdcAddress}`);
  await verify(usdcAddress, "USDCoin", []);
  
  // deploySC;
  // set up
  // script para verificacion del contrato
  const publicSaleName = 'PublicSale'
  const publicSale = await deploySC(publicSaleName, [
    uniSwap,
    "0xf2c4AF6ED9eF104BE99f823bA1E61516101A9541",
    "0xc2a37AEf28beA5A8843C9d922817aC5ea8775d5a"
  ]);
  const publicSaleAddress = await publicSale.getAddress();
  const publicSaleImpl = await printAddress(publicSaleName, publicSaleAddress)
  
  await verify(publicSaleImpl, publicSaleName, [])
  
  
 
}

 //deployMumbai()
 deployGoerli()
  //
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });