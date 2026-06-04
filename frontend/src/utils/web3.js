import { ethers } from "ethers";
import contractData from "./TicketNFT.json";

const CONTRACT_ADDRESS = "0x610178dA211FEF7D417bC0e6FeD39F05609AD788";

export const connectWallet = async () => {
    if (!window.ethereum) {
        throw new Error("Vui lòng cài đặt ví MetaMask!");
    }

    // 1. ÉP METAMASK CHUYỂN SANG MẠNG HARDHAT (Chain ID 31337 -> hệ Hex là 0x7a69)
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x7a69' }],
        });
    } catch (error) {
        console.warn("Lỗi ép mạng, có thể mạng chưa được thêm đúng cách: ", error);
    }

    // 2. Yêu cầu người dùng cấp quyền kết nối ví
    await window.ethereum.request({ method: "eth_requestAccounts" });
    
    // 3. Khởi tạo kết nối Web3
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        contractData.abi,
        signer
    );

    return {
        address: await signer.getAddress(),
        contract
    };
};