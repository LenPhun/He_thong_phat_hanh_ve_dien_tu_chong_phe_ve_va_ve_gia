require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');
const contractData = require('./TicketNFT.json'); 

const app = express();
app.use(cors());
app.use(express.json());

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractData.abi, wallet);

let eventsDB = []; 

app.get('/api/events', (req, res) => {
    res.json({ success: true, events: eventsDB });
});

app.post('/api/events', (req, res) => {
    const newEvent = req.body; 
    eventsDB.push(newEvent);
    console.log("Đã lưu DB sự kiện mới:", newEvent.name);
    res.json({ success: true, message: "Lưu thông tin sự kiện thành công!" });
});

// =====================================================================
// API CHECK-IN QUÉT MÃ QR ĐỘNG (ĐÃ CẬP NHẬT LOGIC CHUẨN)
// =====================================================================
app.post('/api/ticket/checkin', async (req, res) => {
    const { ticketId, timestamp, signature, scanningEventId } = req.body;
    
    try {
        console.log(`Đang kiểm tra vé ID #${ticketId}...`);

        // 1. Phục hồi chữ ký để lấy địa chỉ ví của người cầm điện thoại
        const message = `Xac nhan Check-in Ve #${ticketId} luc ${timestamp}`;
        const signerAddress = ethers.verifyMessage(message, signature);
        
        // 2. GỌI LÊN BLOCKCHAIN KIỂM TRA TRẠNG THÁI VÉ TRƯỚC TIÊN
        const [owner, eventId, used] = await contract.verifyTicket(ticketId);

        // Kiểm tra vé có tồn tại không
        if (owner === "0x0000000000000000000000000000000000000000") {
            return res.status(400).json({ success: false, message: "❌ Vé không tồn tại (Vé giả)!" });
        }
        
        // 🌟 LỚP BẢO VỆ ƯU TIÊN 1: VÉ ĐÃ ĐƯỢC SỬ DỤNG CHƯA?
        if (used) {
            return res.status(400).json({ success: false, message: "❌ Từ chối! Chiếc vé này ĐÃ ĐƯỢC SỬ DỤNG trước đó!" });
        }

        // 🌟 LỚP BẢO VỆ 2: NẾU VÉ CHƯA DÙNG, MỚI KIỂM TRA THỜI GIAN ĐỂ CHỐNG CHỤP MÀN HÌNH
        const currentTime = Date.now();
        if (currentTime - timestamp > 60000 || currentTime - timestamp < 0) {
            return res.status(400).json({ success: false, message: "❌ Mã QR đã HẾT HẠN! Phát hiện hành vi dùng ảnh chụp màn hình." });
        }
        
        // LỚP 3: KIỂM TRA CÓ QUÉT ĐÚNG CỔNG SỰ KIỆN KHÔNG
        if (eventId.toString() !== scanningEventId.toString()) {
            return res.status(400).json({ success: false, message: "❌ Lỗi: Chiếc vé này KHÔNG DÙNG CHO SỰ KIỆN NÀY!" });
        }

        // LỚP 4: KIỂM TRA VÉ CHÍNH CHỦ
        if (owner.toLowerCase() !== signerAddress.toLowerCase()) {
            return res.status(400).json({ success: false, message: "❌ Cảnh báo: Người cầm điện thoại không phải chủ sở hữu hợp pháp!" });
        }

        console.log(`Vé hợp lệ. Đang cắt vé trên Blockchain...`);
        // 3. Nếu qua hết các bài test bảo mật, tiến hành cắt vé (markAsUsed)
        const tx = await contract.markAsUsed(ticketId);
        await tx.wait(); 

        return res.json({ success: true, message: `Check-in thành công vé #${ticketId}! Khách có thể qua cổng.` });
    } catch (error) {
        console.error(error);
        return res.status(400).json({ success: false, message: `❌ Lỗi giải mã QR: Dữ liệu đã bị sửa đổi hoặc sai định dạng.` });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server Backend đang chạy tại http://localhost:${PORT}`));