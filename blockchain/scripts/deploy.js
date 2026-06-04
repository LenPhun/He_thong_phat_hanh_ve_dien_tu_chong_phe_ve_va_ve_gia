const hre = require("hardhat");

async function main() {
  console.log("Đang deploy contract lên mạng local...");
  
  // Lấy Contract Factory
  const TicketNFT = await hre.ethers.getContractFactory("TicketNFT");
  
  // Deploy
  const ticket = await TicketNFT.deploy();
  await ticket.waitForDeployment();
  
  console.log(`🎉 Contract đã được deploy thành công tại địa chỉ: ${ticket.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});