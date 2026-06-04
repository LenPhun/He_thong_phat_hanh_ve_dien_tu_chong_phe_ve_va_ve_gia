import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { QRCodeCanvas } from 'qrcode.react';
import { Ticket, CheckCircle, XCircle, Wallet, ShoppingCart, Calendar, MapPin, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import Swal from 'sweetalert2'; // Import thư viện thông báo
import './UserView.css'; 

export default function UserView({ account, contract }) {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [myTickets, setMyTickets] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [isBuying, setIsBuying] = useState(false);
  const [activeQR, setActiveQR] = useState({}); 
  const [expandedEventId, setExpandedEventId] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/events");
        const data = await res.json();
        if (data.success) {
          setEvents(data.events); 
          const upcomingEvents = data.events.filter(e => e.time > Date.now());
          if (upcomingEvents.length > 0) setSelectedEventId(upcomingEvents[0].id);
        }
      } catch (error) { console.error("Lỗi tải sự kiện:", error); }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    if (contract && account) loadMyTickets(contract, account);
  }, [contract, account]);

  useEffect(() => {
    if (!contract || !account) return;
    const onTicketUsed = () => loadMyTickets(contract, account);
    contract.on("TicketUsed", onTicketUsed);
    return () => contract.off("TicketUsed", onTicketUsed);
  }, [contract, account]);

  const loadMyTickets = async (connectedContract, userAddress) => {
    try {
      const tickets = [];
      for (let i = 1; i <= 20; i++) {
        try {
          const [owner, eventId, used] = await connectedContract.verifyTicket(i);
          if (owner.toLowerCase() === userAddress.toLowerCase()) {
            tickets.push({ id: i, eventId: eventId.toString(), used });
          }
        } catch (err) { continue; }
      }
      setMyTickets(tickets);
    } catch (error) { console.error("Lỗi tải vé:", error); }
  };

  const handleBuyTicket = async () => {
    if (!contract || !selectedEventId) return Swal.fire('Cảnh báo', 'Vui lòng chọn sự kiện!', 'warning');
    try {
      setIsBuying(true);
      const selectedEvt = events.find(e => e.id === selectedEventId);
      
      Swal.fire({
        title: 'Đang xử lý thanh toán...',
        text: 'Vui lòng xác nhận giao dịch mua vé trên MetaMask',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      const tx = await contract.buyTicket(selectedEventId, quantity, { value: ethers.parseEther((selectedEvt.price * quantity).toString()) });
      await tx.wait(); 
      
      Swal.fire('Thành công!', `🎉 Mua ${quantity} vé thành công!`, 'success');
      
      await loadMyTickets(contract, account);
      setExpandedEventId(selectedEventId); 
    } catch (error) { 
      Swal.fire('Giao dịch thất bại', error.reason || error.message, 'error');
    } finally { 
      setIsBuying(false); 
    }
  };

  const handleTransfer = async (ticketId) => {
    // Modal nhập địa chỉ thay cho prompt mặc định
    const { value: toAddress } = await Swal.fire({
      title: 'Kiểm thử chống Phe Vé',
      input: 'text',
      inputLabel: 'Nhập địa chỉ ví người nhận',
      inputPlaceholder: '0x...',
      showCancelButton: true,
      confirmButtonText: 'Chuyển vé',
      cancelButtonText: 'Hủy'
    });

    if (!toAddress) return;
    
    Swal.fire({ title: 'Đang xử lý...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    
    try {
      const tx = await contract.transferFrom(account, toAddress, ticketId);
      await tx.wait(); 
    } catch (error) { 
      Swal.fire({
        icon: 'error',
        title: '🛡️ HỆ THỐNG BẢO VỆ KÍCH HOẠT',
        text: error.reason || "Giao dịch chuyển nhượng bị từ chối!"
      });
    }
  };

  const generateDynamicQR = async (ticketId) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const timestamp = Date.now();
      const signature = await signer.signMessage(`Xac nhan Check-in Ve #${ticketId} luc ${timestamp}`);
      const qrPayload = JSON.stringify({ ticketId, timestamp, signature });
      console.log(`=== MÃ JSON CỦA VÉ #${ticketId} (Hết hạn sau 60s) ===`);
      console.log(qrPayload);
      
      setActiveQR(prev => ({...prev, [ticketId]: qrPayload}));
      setTimeout(() => setActiveQR(prev => ({...prev, [ticketId]: null})), 60000);
    } catch (error) { 
      Swal.fire('Đã hủy', 'Bạn đã hủy quá trình ký mã bảo mật!', 'info');
    }
  };

  const groupedTickets = myTickets.reduce((acc, ticket) => {
    if (!acc[ticket.eventId]) acc[ticket.eventId] = [];
    acc[ticket.eventId].push(ticket);
    return acc;
  }, {});

  const upcomingEvents = events.filter(e => e.time > Date.now());
  const activeEventData = upcomingEvents.find(e => e.id === selectedEventId);

  return (
    <div className="uv-container">
      <h1 className="uv-title">CỔNG BÁN VÉ SỰ KIỆN WEB3</h1>
      <div className="uv-grid">
        
        {/* CỘT MUA VÉ */}
        <div className="uv-card">
          <div className="uv-card-header">
            <Calendar size={24} color="#4F46E5" />
            <select 
              value={selectedEventId} onChange={(e) => setSelectedEventId(e.target.value)}
              style={{ fontSize: '18px', fontWeight: 'bold', border: 'none', outline: 'none', width: '100%', cursor: 'pointer', backgroundColor: 'transparent' }}
            >
              {upcomingEvents.length === 0 ? <option>Không có sự kiện nào đang mở bán</option> : null}
              {upcomingEvents.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
            </select>
          </div>
          <div className="uv-event-info">
            <p className="uv-info-row"><Clock size={18} /> <strong>Thời gian:</strong> {activeEventData ? new Date(activeEventData.time).toLocaleString('vi-VN') : "---"}</p>
            <p className="uv-info-row"><MapPin size={18} /> <strong>Địa điểm:</strong> {activeEventData ? activeEventData.location : "---"}</p>
          </div>
          <div className="uv-buy-section">
            <div className="uv-price-tag">
              <span className="uv-price-label">Giá vé:</span>
              <span className="uv-price-value">{activeEventData ? activeEventData.price : 0} ETH</span>
            </div>
            <div>
              <label style={{ fontWeight: '600' }}>Số lượng mua (Tối đa 2 vé/sự kiện):</label>
              <select value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="uv-select-box">
                <option value={1}>1 Vé</option><option value={2}>2 Vé</option>
              </select>
            </div>
            <button onClick={handleBuyTicket} disabled={isBuying || !account || upcomingEvents.length === 0} className="uv-btn-buy">
              <ShoppingCart size={20} />{isBuying ? "Đang xử lý..." : "Thanh toán ngay"}
            </button>
          </div>
        </div>

        {/* CỘT VÉ CỦA TÔI */}
        <div className="uv-card">
          <div className="uv-card-header">
            <Ticket size={24} color="#10B981" />
            <h2 className="uv-card-title" style={{ color: '#10B981' }}>Vé Của Tôi</h2>
          </div>
          <div style={{ minHeight: '300px' }}>
            {!account ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}><Wallet size={48} color="#9CA3AF" /><p>Chưa kết nối ví.</p></div>
            ) : Object.keys(groupedTickets).length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}><Ticket size={48} color="#9CA3AF" /><p>Bạn chưa sở hữu chiếc vé nào.</p></div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {Object.entries(groupedTickets).map(([evtId, tks]) => {
                  const evtName = events.find(e => e.id === evtId)?.name || `Sự kiện #${evtId}`;
                  const isExpanded = expandedEventId === evtId;

                  return (
                    <div key={evtId} style={{ border: '1px solid #E5E7EB', borderRadius: '10px', overflow: 'hidden' }}>
                      <div 
                        onClick={() => setExpandedEventId(isExpanded ? null : evtId)}
                        style={{ padding: '15px', backgroundColor: '#F9FAFB', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold', color: '#374151' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Ticket size={18} color="#10B981" />
                          <span>{evtName} ({tks.length} vé)</span>
                        </div>
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>

                      {isExpanded && (
                        <div className="uv-ticket-grid" style={{ padding: '15px', backgroundColor: 'var(--bg-main)' }}>
                          {tks.map(ticket => (
                            <div key={ticket.id} className="uv-ticket-item" style={{ borderColor: ticket.used ? '#FCA5A5' : '#6EE7B7', backgroundColor: ticket.used ? '#FEF2F2' : 'var(--bg-main)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                <span style={{ fontWeight: '700' }}>Vé #{ticket.id}</span>
                                {ticket.used ? <span className="uv-badge-used"><XCircle size={14}/> Đã dùng</span> : <span className="uv-badge-valid"><CheckCircle size={14}/> Hợp lệ</span>}
                              </div>
                              
                              <div className="uv-qr-wrapper" style={{ minHeight: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {ticket.used ? (
                                   <QRCodeCanvas value={JSON.stringify({ ticketId: ticket.id })} size={140} level={"H"} fgColor={"#9CA3AF"} />
                                ) : activeQR[ticket.id] ? (
                                  <QRCodeCanvas value={activeQR[ticket.id]} size={140} level={"H"} />
                                ) : (
                                  <button onClick={() => generateDynamicQR(ticket.id)} style={{ padding: '10px 15px', backgroundColor: '#10B981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                                    Lấy QR Check-in
                                  </button>
                                )}
                              </div>
                              
                              {!ticket.used && (
                                <button onClick={() => handleTransfer(ticket.id)} style={{ display: 'block', width: '100%', padding: '8px', marginTop: '10px', backgroundColor: '#EF4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                                  Bán vé
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}