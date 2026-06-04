<p align="center">
  <img src="poster.png" alt="CryptoTicket Banner" width="100%">
</p>
# 🎫 Hệ Thống Quản Lý Vé Sự Kiện Trên Blockchain (CryptoTicket)

Hệ thống quản lý vé sự kiện sử dụng công nghệ Blockchain và NFT để đảm bảo tính minh bạch, chống giả mạo và quản lý check-in tự động.

## 📋 Tổng Quan

Dự án này là một ứng dụng full-stack blockchain cho phép:
- **Ban tổ chức** tạo sự kiện và phát hành vé dưới dạng NFT
- **Người dùng** mua vé và nhận mã QR để check-in
- **Nhân viên soát vé** quét mã QR để xác thực và check-in tại cổng

## 🏗️ Kiến Trúc Hệ Thống

```
Blockchain/
├── backend/          # Node.js/Express API Server
├── blockchain/       # Hardhat Smart Contracts
└── frontend/         # React + Vite Web Application
```

### Các Thành Phần Chính

#### 1. **Backend** (`/backend`)
- **Framework**: Express.js
- **Blockchain Library**: ethers.js v6
- **Chức năng**:
  - Kết nối và tương tác với smart contract
  - API tạo mã QR cho vé
  - API check-in và xác thực vé
  - Xử lý giao dịch blockchain

#### 2. **Blockchain** (`/blockchain`)
- **Framework**: Hardhat
- **Smart Contract**: TicketNFT.sol
- **Chức năng**:
  - Tạo sự kiện (Event)
  - Phát hành vé dưới dạng NFT
  - Xác thực vé (verifyTicket)
  - Đánh dấu vé đã sử dụng (markAsUsed)
  - Chống chuyển nhượng vé (anti-scalping)

#### 3. **Frontend** (`/frontend`)
- **Framework**: React 19 + Vite
- **Routing**: React Router DOM
- **Blockchain Library**: ethers.js v6
- **QR Code**: qrcode.react
- **Chức năng**:
  - Giao diện mua vé
  - Hiển thị mã QR
  - Kết nối ví MetaMask
  - Quản lý vé cá nhân

## ✨ Tính Năng Nổi Bật

### 🔒 Bảo Mật & Chống Giả Mạo
- **NFT Tickets**: Mỗi vé là một NFT duy nhất trên blockchain
- **Non-transferable**: Vé không thể chuyển nhượng (chống phe vé)
- **Check-in Verification**: Xác thực real-time trên blockchain
- **Anti-fraud**: Phát hiện vé giả, vé đã sử dụng

### 🎯 Chức Năng Chính
- **Tạo Sự Kiện**: Ban tổ chức tạo sự kiện với giới hạn số lượng vé
- **Mua Vé**: Người dùng mua vé bằng crypto
- **Mã QR**: Tự động tạo mã QR cho mỗi vé
- **Check-in**: Quét mã QR tại cổng, xác thực trên blockchain
- **Lịch Sử**: Theo dõi trạng thái vé (đã mua/đã sử dụng)

## 🛠️ Công Nghệ Sử Dụng

### Backend
- Node.js
- Express.js
- ethers.js (v6.16.0)
- CORS
- dotenv
- qrcode

### Blockchain
- Solidity (^0.8.20)
- Hardhat (v2.22.15)
- ethers.js

### Frontend
- React (v19.2.6)
- Vite (v8.0.12)
- React Router DOM (v7.15.1)
- ethers.js (v6.16.0)
- qrcode.react (v4.2.0)

## 📦 Cài Đặt & Chạy

### Yêu Cầu Đầu Tiên
- Node.js (v18+)
- npm hoặc yarn
- MetaMask (để tương tác với blockchain)

---

## 🎯 KHỞI TẠO HỆ THỐNG TỪ ĐẦU (QUAN TRỌNG)

Để khởi tạo hệ thống từ đầu, bạn cần thực hiện theo đúng trình tự sau:

### 📝 Checklist Khởi Tạo

- [ ] Cài đặt dependencies cho 3 folder
- [ ] Biên dịch smart contract
- [ ] Khởi động Hardhat local network
- [ ] Deploy smart contract
- [ ] Copy contract address
- [ ] Copy ABI file sang backend và frontend
- [ ] Tạo file .env cho backend
- [ ] Cấu hình contract address trong frontend
- [ ] Chạy backend server
- [ ] Chạy frontend
- [ ] Kết nối MetaMask

---

## 🚀 HƯỚNG DẪN CHI TIẾT CHẠY DỰ ÁN

### BƯỚC 1: Cài Đặt Dependencies Cho Tất Cả Các Folder

Mở terminal tại thư mục gốc `d:\Thue\Blockchain` và chạy:

```bash
# Cài đặt cho blockchain folder
cd blockchain
npm install

# Cài đặt cho backend folder
cd ../backend
npm install

# Cài đặt cho frontend folder
cd ../frontend
npm install
```

Hoặc chạy tất cả trong PowerShell:
```powershell
cd blockchain; npm install; cd ../backend; npm install; cd ../frontend; npm install
```

---

### BƯỚC 2: Cấu Hình & Deploy Smart Contract

#### 2.1. Kiểm tra Hardhat Config
```bash
cd blockchain
npx hardhat help
```

#### 2.2. Biên dịch Smart Contract
```bash
npx hardhat compile
```

#### 2.3. Deploy Contract Lên Local Network (Để Test)

**Khởi động Hardhat local network:**
```bash
npx hardhat node
```
*Lệnh này sẽ chạy một local blockchain tại `http://localhost:8545`*

**Mở terminal mới và deploy contract:**
```bash
cd blockchain
npx hardhat run scripts/deploy.js --network localhost
```

*Sau khi deploy, copy contract address được hiển thị*

#### 2.4. (Tùy chọn) Deploy Lên Testnet
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

---

### BƯỚC 3: Cấu Hình Backend

#### 3.1. Tạo File `.env` Trong Folder `backend`

Tạo file `d:\Thue\Blockchain\backend\.env` với nội dung:

```env
# Nếu dùng Hardhat local network
RPC_URL=http://localhost:8545

# Nếu dùng testnet (ví dụ Sepolia)
# RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY

# Private key của account deploy contract (từ Hardhat account)
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# Contract address từ bước deploy
CONTRACT_ADDRESS=0xYourContractAddress

# Port cho backend server
PORT=5000
```

**Lưu ý:**
- Private key ở trên là default account của Hardhat local network
- Thay `CONTRACT_ADDRESS` bằng address thực tế sau khi deploy

#### 3.2. Copy Contract ABI Vào Backend

```bash
# Copy file ABI từ blockchain folder sang backend folder
copy blockchain\artifacts\contracts\TicketNFT.sol\TicketNFT.json backend\TicketNFT.json
```

Hoặc copy thủ công file từ:
`blockchain/artifacts/contracts/TicketNFT.sol/TicketNFT.json`
sang:
`backend/TicketNFT.json`

---

### BƯỚC 4: Chạy Backend Server

```bash
cd backend
node server.js
```

Hoặc nếu đã cài nodemon:
```bash
npm run dev
```

Backend sẽ chạy tại `http://localhost:5000`

**Test kết nối:**
```bash
curl http://localhost:5000/api/test-connection
```

---

### BƯỚC 5: Cấu Hình Frontend

#### 5.1. Copy Contract ABI Vào Frontend

```bash
copy blockchain\artifacts\contracts\TicketNFT.sol\TicketNFT.json frontend\src\TicketNFT.json
```

Hoặc copy thủ công từ:
`blockchain/artifacts/contracts/TicketNFT.sol/TicketNFT.json`
sang:
`frontend/src/TicketNFT.json`

#### 5.2. Cấu Hình Contract Address Trong Frontend

Mở file `frontend/src/App.jsx` hoặc `frontend/src/web3.js` và cập nhật:
- Contract address
- Network RPC URL

---

### BƯỚC 6: Chạy Frontend

```bash
cd frontend
npm run dev
```

Frontend sẽ chạy tại `http://localhost:5173`

---

### BƯỚC 7: Kết Nối MetaMask

1. Mở MetaMask extension
2. Thêm network:
   - **Network Name**: Hardhat Local
   - **RPC URL**: http://localhost:8545
   - **Chain ID**: 31337
   - **Currency Symbol**: ETH
3. Import account với private key từ Hardhat:
   ```
   0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   ```
4. Đảm bảo có đủ ETH (local network có sẵn)

---

## 📋 TỔNG HỢP CÁC LỆNH CẦN CHẠY

### Để Chạy Full System (3 Terminal Cần Thiết):

**Terminal 1 - Hardhat Local Network:**
```bash
cd blockchain
npx hardhat node
```

**Terminal 2 - Backend Server:**
```bash
cd backend
node server.js
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
```

---

## 🧪 Test Smart Contract

```bash
cd blockchain
npx hardhat test
```

---

## 🔍 Kiểm Tra Hệ Thống

1. **Backend**: Truy cập `http://localhost:5000/api/test-connection`
2. **Frontend**: Truy cập `http://localhost:5173`
3. **Blockchain**: Kiểm tra Hardhat node terminal
4. **MetaMask**: Kiểm tra balance và transactions

## 📚 API Documentation

### Backend API Endpoints

#### 1. Test Connection
```http
GET /api/test-connection
```
Kiểm tra kết nối backend với blockchain.

#### 2. Tạo Mã QR
```http
GET /api/ticket/qr/:ticketId
```
Tạo mã QR cho vé dựa trên ticketId.

#### 3. Check-in Vé
```http
POST /api/ticket/checkin
Content-Type: application/json

{
  "ticketId": "123"
}
```
Xác thực và check-in vé tại cổng.

## 🔧 Smart Contract Functions

### TicketNFT.sol

#### `createEvent(uint256 _maxTickets, uint256 _priceInWei)`
- Tạo sự kiện mới
- Chỉ owner (ban tổ chức) có thể gọi
- Thiết lập giới hạn vé và giá

#### `buyTicket(uint256 _eventId)`
- Mua vé cho sự kiện
- Tự động mint NFT cho người mua
- Giới hạn tối đa 2 vé/user/sự kiện

#### `verifyTicket(uint256 _ticketId)`
- Xác thực vé
- Trả về: owner, eventId, used status

#### `markAsUsed(uint256 _ticketId)`
- Đánh dấu vé đã sử dụng
- Được gọi khi check-in tại cổng

#### `ownerOf(uint256 tokenId)`
- Xem chủ sở hữu của vé

## 🎮 Hướng Dẫn Sử Dụng

### Đối Với Ban Tổ Chức
1. Deploy smart contract TicketNFT
2. Sử dụng function `createEvent` để tạo sự kiện
3. Thiết lập giá vé và số lượng vé
4. Chia sẻ contract address cho frontend

### Đối Với Người Dùng
1. Kết nối ví MetaMask trên frontend
2. Chọn sự kiện và mua vé
3. Thanh toán bằng crypto
4. Nhận mã QR cho vé
5. Đến sự kiện và hiển thị mã QR để check-in

### Đối Với Nhân Viên Soát Vé
1. Sử dụng app check-in (backend API)
2. Quét mã QR của khách
3. Hệ thống tự động xác thực trên blockchain
4. Vé hợp lệ → Cho phép qua cổng
5. Vé giả/đã dùng → Từ chối

## 🔐 Lưu Ý Bảo Mật

- **KHÔNG** commit file `.env` vào git
- **KHÔNG** chia sẻ private key
- Sử dụng testnet cho development
- Kiểm tra kỹ contract trước khi deploy mainnet
- Backup seed phrase của ví MetaMask

## 🐛 Troubleshooting

### Lỗi kết nối blockchain
- Kiểm tra RPC_URL trong `.env`
- Đảm bảo ví có đủ ETH cho gas fee
- Kiểm tra network đang đúng (testnet/mainnet)

### Lỗi deploy contract
- Kiểm tra Hardhat config
- Đảm bảo có đủ ETH trong ví deploy
- Xác nhận contract address sau khi deploy

### Lỗi frontend
- Kiểm tra MetaMask đã unlock
- Đảm bảo đang đúng network
- Kiểm tra console browser để xem lỗi

## 📄 License

MIT License

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Liên Hệ

Nếu có câu hỏi hoặc vấn đề, vui lòng tạo issue trên repository.

---

**Note**: Đây là dự án học tập/demonstration. Cần kiểm tra kỹ và audit security trước khi sử dụng trong production.
