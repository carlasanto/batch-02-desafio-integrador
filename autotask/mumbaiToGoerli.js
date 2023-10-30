const { ethers } = require("ethers");
const {
  DefenderRelaySigner,
  DefenderRelayProvider,
} = require("@openzeppelin/defender-relay-client/lib/ethers");

exports.handler = async function (data) {
  // Este evento viene de la red mumbai cuando el usuario compra un NFT
  const payload = data.request.body.events;

  // Inicializa Proveedor: en este caso es OZP
  const provider = new DefenderRelayProvider(data);
  const signer = new DefenderRelaySigner(data, provider, { speed: "fast" });

  // Filtrando eventos
  var onlyEvents = payload[0].matchReasons.filter((e) => e.type === "event");
  if (onlyEvents.length === 0) return;

  // Filtrando solo eventos de quema de NFT
  var event = onlyEvents.filter((ev) => ev.signature.includes("Burn"));

  if (event.length === 0) return;

  // Mismos parámetros que en el evento
  var { account, amount } = event[0].params;

  // Dirección del contrato BBTKN en Goerli
  var bbtknContractAddress = "0xc2a37AEf28beA5A8843C9d922817aC5ea8775d5a"; // Reemplazar con la dirección del contrato BBTKN 
  // Abi del contrato BBTKN 
  var bbtknAbi = ["function mint(address to, uint256 tokenId)"];
  // Crear una instancia del contrato BBTKN 
  var bbtknContract = new ethers.Contract(bbtknContractAddress, bbtknAbi, signer);
  // Llama al método mint para acuñar BBTKN 
  var tx = await bbtknContract.mint(account, amount);
  var res = await tx.wait();
  return res;
};
