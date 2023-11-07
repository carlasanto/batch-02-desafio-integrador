const { ethers } = require("ethers");
const {
  DefenderRelaySigner,
  DefenderRelayProvider,
} = require("@openzeppelin/defender-relay-client/lib/ethers");

exports.handler = async function (data) {
  // Este evento viene del sentinel
  const payload = data.request.body.events;

  // Inicializa el Proveedor: OZP
  const provider = new DefenderRelayProvider(data);
  // Se crea el signer, es quien será el msg.sender en los Smart Contracts
  const signer = new DefenderRelaySigner(data, provider, { speed: "fast" });

  // Filtrando eventos
  var onlyEvents = payload[0].matchReasons.filter((e) => e.type === "event");
  if (onlyEvents.length === 0) return;

  // Filtrando solo eventos de compra de NFT
  var event = onlyEvents.filter((ev) =>
    ev.signature.includes("PurchaseNftWithId")
  );

  

  // Mismos parametros que en el evento
  var { account, id } = event[0].params;

  // Dirección del contrato de NFT en Mumbai
  var CuyCollectionAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; // Reemplazar con la dirección del contrato de NFT
  // Abi del contrato de NFT 
  var tokenAbi = ["function safeMint(address to, uint256 tokenId)"];
  // Crear una instancia del contrato de NFT 
  var tokenContract = new ethers.Contract(CuyCollectionAddress, tokenAbi, signer);
  // Llama al método safeMint para acuñar el NFT 
  var tx = await tokenContract.safeMint(account, id);
  var res = await tx.wait();
  return res;
};
