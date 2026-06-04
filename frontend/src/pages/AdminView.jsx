import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { ChevronDown, ChevronUp, PlusCircle, ScanLine, Camera, Keyboard } from 'lucide-react';
import { Scanner } from '@yudiel/react-qr-scanner';
import Swal from 'sweetalert2'; // Import thư viện thông báo xịn xò
import '../App.css';

export default function AdminView({ account, contract }) {
  const [qrDataInput, setQrDataInput] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [events, setEvents] = useState([]);
  const [scanningEventId, setScanningEventId] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [scanMode, setScanMode] = useState("camera"); 
  const [isProcessing, setIsProcessing] = useState(false);

  const [eventForm, setEventForm] = useState({ name: "", location: "", date: "", maxTickets: "", price: "" });

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/events");
        const data = await res.json();
        if (data.success) {
          setEvents(data.events);
          if (data.events.length > 0) setScanningEventId(data.events[0].id);
        }
      } catch (error) { console.error("Lỗi tải sự kiện:", error); }
    };
    fetchEvents();
  }, []);

  const handleInputChange = (e) => setEventForm({ ...eventForm, [e.target.name]: e.target.value });

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!contract) return Swal.fire('Cảnh báo', 'Chưa kết nối ví!', 'warning');
    
    try {
      setIsCreating(true);
      const priceInWei = ethers.parseEther(eventForm.price.toString());
      
      // Hiện Pop-up Loading
      Swal.fire({
        title: 'Đang khởi tạo trên Blockchain...',
        text: 'Vui lòng xác nhận giao dịch trên ví MetaMask của bạn',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      const tx = await contract.createEvent(eventForm.maxTickets, priceInWei); 
      await tx.wait();

      const currentId = await contract.nextEventId();
      const eventTimestamp = new Date(eventForm.date).getTime();

      await fetch("http://localhost:5000/api/events", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: currentId.toString(), name: eventForm.name, location: eventForm.location, time: eventTimestamp, price: eventForm.price })
      });

      // Thông báo thành công xịn xò
      Swal.fire('Thành công!', '🎉 Xuất bản sự kiện hoàn tất!', 'success');
      
      setEventForm({ name: "", location: "", date: "", maxTickets: "", price: "" });
      setIsFormOpen(false); 
      
      // Tải lại danh sách sự kiện ngầm
      const res = await fetch("http://localhost:5000/api/events");
      const data = await res.json();
      if (data.success) setEvents(data.events);

    } catch (error) {
      Swal.fire('Lỗi tạo sự kiện', error.reason || error.message, 'error');
    } finally { 
      setIsCreating(false); 
    }
  };

  const processCheckIn = async (qrString) => {
    if (!scanningEventId) return Swal.fire('Cảnh báo', 'Vui lòng chọn sự kiện đang soát vé ở phía trên!', 'warning');
    if (isProcessing) return; 
    
    try {
      setIsProcessing(true);
      const qrData = JSON.parse(qrString); 
      const payload = { ...qrData, scanningEventId };

      const response = await fetch("http://localhost:5000/api/ticket/checkin", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });

      const data = await response.json();
      
      if (data.success) {
        Swal.fire('Hợp lệ!', data.message, 'success');
        setQrDataInput(""); 
      } else {
        Swal.fire('Từ chối!', data.message, 'error');
      }
    } catch (error) {
      Swal.fire('Lỗi định dạng', 'Máy không đọc được mã QR này (Sai chuẩn bảo mật)', 'error');
    } finally {
      setTimeout(() => setIsProcessing(false), 2000);
    }
  };

  const handleManualSubmit = () => {
    if (!qrDataInput) return Swal.fire('Cảnh báo', 'Vui lòng dán chuỗi dữ liệu QR!', 'warning');
    processCheckIn(qrDataInput);
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px', fontFamily: 'Inter, sans-serif' }}>
      <h1 style={{ textAlign: 'center', color: '#1F2937', marginBottom: '30px' }}>CỔNG SOÁT VÉ & QUẢN TRỊ ADMIN</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
        
        {/* PHẦN 1: MÁY QUÉT VÉ */}
        <div style={{ padding: '30px', border: '2px solid #10B981', borderRadius: '16px', backgroundColor: '#FFFFFF', boxShadow: '0 10px 25px rgba(16, 185, 129, 0.15)' }}>
          <h2 style={{ marginTop: 0, color: '#10B981', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center', fontSize: '24px' }}>
            <ScanLine size={32} /> MÁY QUÉT QR CHECK-IN
          </h2>
          
          <div style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#ECFDF5', borderRadius: '12px', border: '1px solid #A7F3D0' }}>
            <label style={{...styles.label, color: '#065F46', fontSize: '16px'}}>📍 Bạn đang soát vé cho cổng sự kiện nào?</label>
            <select 
              value={scanningEventId} onChange={(e) => setScanningEventId(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #10B981', fontSize: '16px', fontWeight: 'bold', outline: 'none', cursor: 'pointer' }}
            >
              {events.length === 0 ? <option value="">Chưa có sự kiện nào</option> : null}
              {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button 
              onClick={() => setScanMode("camera")} 
              style={{ flex: 1, padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', border: scanMode === 'camera' ? '2px solid #10B981' : '1px solid #D1D5DB', backgroundColor: scanMode === 'camera' ? '#ECFDF5' : '#F9FAFB', color: scanMode === 'camera' ? '#065F46' : '#6B7280' }}
            >
              <Camera size={18} /> Quét bằng Camera
            </button>
            <button 
              onClick={() => setScanMode("manual")} 
              style={{ flex: 1, padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', border: scanMode === 'manual' ? '2px solid #4F46E5' : '1px solid #D1D5DB', backgroundColor: scanMode === 'manual' ? '#EEF2FF' : '#F9FAFB', color: scanMode === 'manual' ? '#3730A3' : '#6B7280' }}
            >
              <Keyboard size={18} /> Nhập thủ công
            </button>
          </div>

          {scanMode === "camera" ? (
            <div style={{ width: '100%', maxWidth: '320px', margin: '0 auto', aspectRatio: '1 / 1', borderRadius: '16px', overflow: 'hidden', border: '3px dashed #10B981', backgroundColor: '#000000', position: 'relative', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
              
              <Scanner 
                onScan={(detectedCodes) => {
                  if (detectedCodes && detectedCodes.length > 0) {
                    processCheckIn(detectedCodes[0].rawValue);
                  }
                }}
                onError={(error) => console.log(error?.message)}
                scanDelay={2000} 
              />
              
              {/* TIA LASER HIỆU ỨNG ĐƯỢC CHÈN VÀO ĐÂY */}
              {!isProcessing && <div className="laser-line"></div>}

              {isProcessing && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981', fontWeight: 'bold', fontSize: '18px', zIndex: 10 }}>
                  ⏳ Đang xử lý vé...
                </div>
              )}
              
              <div style={{ position: 'absolute', top: '20%', left: '20%', right: '20%', bottom: '20%', border: '2px solid rgba(16, 185, 129, 0.5)', borderRadius: '12px', pointerEvents: 'none', zIndex: 5 }}></div>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: '15px', color: '#4B5563', fontWeight: '500', marginBottom: '10px' }}>
                Mô phỏng dữ liệu (Paste chuỗi JSON QR vào đây):
              </p>
              <textarea 
                placeholder='{"ticketId": 1, "timestamp": 1234567, "signature": "0x..."}'
                value={qrDataInput} onChange={(e) => setQrDataInput(e.target.value)}
                style={{ ...styles.input, height: '140px', backgroundColor: '#111827', color: '#34D399', fontFamily: 'monospace', fontSize: '15px', border: 'none', borderRadius: '12px', padding: '15px' }}
              />
              <button onClick={handleManualSubmit} style={{...styles.scanBtn, padding: '16px', fontSize: '18px', borderRadius: '12px', backgroundColor: '#4F46E5'}}>
                🔍 BẮT ĐẦU XÁC THỰC
              </button>
            </div>
          )}
        </div>

        {/* PHẦN 2: FORM TẠO SỰ KIỆN */}
        <div style={{ border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#F9FAFB' }}>
          <div 
            onClick={() => setIsFormOpen(!isFormOpen)}
            style={{ padding: '20px', backgroundColor: '#EEF2FF', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.3s' }}
          >
            <h3 style={{ margin: 0, color: '#4F46E5', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <PlusCircle size={22} /> 🛠️ Cài Đặt & Xuất Bản Sự Kiện Mới
            </h3>
            {isFormOpen ? <ChevronUp size={24} color="#4F46E5" /> : <ChevronDown size={24} color="#4F46E5" />}
          </div>

          {isFormOpen && (
            <div style={{ padding: '25px', borderTop: '1px solid #E5E7EB' }}>
              <form onSubmit={handleCreateEvent} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div><label style={styles.label}>Tên sự kiện</label><input type="text" name="name" value={eventForm.name} onChange={handleInputChange} style={styles.input} required /></div>
                <div><label style={styles.label}>Địa điểm</label><input type="text" name="location" value={eventForm.location} onChange={handleInputChange} style={styles.input} required /></div>
                <div><label style={styles.label}>Ngày giờ diễn ra</label><input type="datetime-local" name="date" value={eventForm.date} onChange={handleInputChange} style={styles.input} required /></div>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <div style={{ flex: 1 }}><label style={styles.label}>Tổng vé phát hành (Max)</label><input type="number" name="maxTickets" value={eventForm.maxTickets} onChange={handleInputChange} style={styles.input} min="1" required /></div>
                  <div style={{ flex: 1 }}><label style={styles.label}>Giá vé (ETH)</label><input type="number" step="0.001" name="price" value={eventForm.price} onChange={handleInputChange} style={styles.input} min="0" required /></div>
                </div>
                <button type="submit" disabled={isCreating} style={styles.submitBtn}>{isCreating ? "Đang xử lý..." : "+ Khởi Tạo Lên Blockchain"}</button>
              </form>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

const styles = {
  label: { display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#374151', marginBottom: '8px' },
  input: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB', boxSizing: 'border-box', fontSize: '15px' },
  submitBtn: { width: '100%', padding: '14px', backgroundColor: '#4F46E5', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px', fontSize: '16px' },
  scanBtn: { width: '100%', padding: '12px', backgroundColor: '#10B981', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '15px' }
};