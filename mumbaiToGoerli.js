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

  

  // Mismos parámetros que en el evento
  var { account } = event[0].params;

  // Dirección del contrato BBTKN en Goerli
  var BBitesToken = "0xc2a37AEf28beA5A8843C9d922817aC5ea8775d5a"; // Reemplazar con la dirección del contrato BBTKN 
  // Abi del contrato BBTKN 
  var tokenAbi = ["function mint(address to, uint256 amount)"];
  // Crear una instancia del contrato BBTKN 
  var tokenContract = new ethers.Contract(BBitesToken, tokenAbi, signer);
  // Llama al método mint para acuñar BBTKN 
  var tx = await tokenContract.mint(account, ethers.parseUnits('100000', 18));
  var res = await tx.wait();
  return res;
};
