const { ethers, upgrades } = require("hardhat")
//Define la función asincronica
async function upgradeBBitesToken() {
  const proxyAddress = '0xc2a37AEf28beA5A8843C9d922817aC5ea8775d5a' //Drirección proxy
  const BbitesTokenV2 = await ethers.getContractFactory('BBitesToken') //Crea una nueva instancia de la fábrica de contratos inteligentes para el contrato BBitesTokenV2, que es la nueva versión del contrato.
  const bbitesTokenV2 = await upgrades.upgradeProxy( //Utiliza la función upgradeProxy de OpenZeppelin Upgrades para actualizar el contrato proxy en la dirección especificada con la nueva implementación 
    proxyAddress,
    BbitesTokenV2
  )

  var tx = await bbitesTokenV2.waitForDeployment()
  // Esperar a que se complete la transacción de implementación. El resultado se almacena en la variable tx.
  console.log(tx)
  return;
  await tx.deploymentTransaction().wait(5) //Espera adicional

  var implV2 = await upgrades.erc1967.getImplementationAddress(proxyAddress)//Obtiene la dirección de la nueva implementación del contrato proxy y la almacena en la variable implV2.
  await hre.run('verify:verify', {
    address: implV2,
    constructorArguments: [] // La verificación incluye la dirección de la nueva implementación y los argumentos del constructor en este caso se pasan como un arreglo vacío.
  })

  console.log(implV2) //  Imprime la dirección de la nueva implementación del contrato.

}

upgradeBBitesToken()
.catch(error => {
  console.error(error);
  process.exitCode = 1;
})