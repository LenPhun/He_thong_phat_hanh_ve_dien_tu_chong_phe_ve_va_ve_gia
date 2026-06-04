import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { connectWallet } from './utils/web3';
import UserView from './pages/UserView';
import AdminView from './pages/AdminView';

// Import bộ icon siêu đẹp từ lucide-react
import { ShieldCheck, Store, Wallet, CheckCircle2, Hexagon } from 'lucide-react';

const ADMIN_WALLET = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266".toLowerCase();

function App() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);

  const handleConnect = async () => {
    try {
      const { address, contract } = await connectWallet();
      setAccount(address);
      setContract(contract);
    } catch (error) {
      alert("Lỗi kết nối ví: " + error.message);
    }
  };

  return (
    <Router>
      {/* BAO PHỦ TOÀN BỘ APP BẰNG MÀU NỀN XÁM NHẠT (Giúp các Card màu trắng nổi bật hơn) */}
      <div style={{ backgroundColor: '#F3F4F6', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
        
        {/* THANH ĐIỀU HƯỚNG (NAVBAR) - Chuẩn thiết kế Web3 */}
        <nav style={styles.navbar}>
          <div style={styles.navContainer}>
            
            {/* CỘT TRÁI: LOGO & MENU */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
              
              {/* LOGO */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Hexagon size={32} color="#4F46E5" fill="#EEF2FF" />
                <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: '#111827', letterSpacing: '0.5px' }}>
                  BÁN VÉ                </h1>
              </div>

              {/* MENU ĐIỀU HƯỚNG */}
              <div style={{ display: 'flex', gap: '15px' }}>
                {account && account.toLowerCase() === ADMIN_WALLET ? (
                  <Link to="/admin" style={styles.navLinkAdmin}>
                    <ShieldCheck size={18} />
                    <span>Trang Quản Trị Admin</span>
                  </Link>
                ) : (
                  <Link to="/" style={styles.navLinkUser}>
                    <Store size={18} />
                    <span>Cửa Hàng Vé</span>
                  </Link>
                )}
              </div>
            </div>

            {/* CỘT PHẢI: NÚT KẾT NỐI VÍ METAMASK */}
            <div>
              {!account ? (
                <button onClick={handleConnect} style={styles.connectBtn}>
                  <Wallet size={18} />
                  <span>Kết nối MetaMask</span>
                </button>
              ) : (
                <div style={styles.connectedBadge}>
                  <CheckCircle2 size={18} color="#059669" />
                  <span>{account.substring(0, 6)}...{account.substring(account.length - 4)}</span>
                </div>
              )}
            </div>
            
          </div>
        </nav>

        {/* KHU VỰC HIỂN THỊ NỘI DUNG CHÍNH */}
        <main style={{ padding: '40px 20px' }}>
          <Routes>
            {/* Lớp chặn: Nếu Admin cố vào trang chủ, đá thẳng sang /admin */}
            <Route path="/" element={
              account && account.toLowerCase() === ADMIN_WALLET 
                ? <Navigate to="/admin" /> 
                : <UserView account={account} contract={contract} />
            } />
            
            <Route path="/admin" element={<AdminView account={account} contract={contract} />} />
          </Routes>
        </main>

      </div>
    </Router>
  );
}

// BỘ STYLE CHO APP.JSX
const styles = {
  navbar: {
    backgroundColor: '#ffffff',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    position: 'sticky',
    top: 0,
    zIndex: 50
  },
  navContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '76px'
  },
  navLinkAdmin: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    textDecoration: 'none',
    color: '#DC2626',
    fontWeight: '600',
    backgroundColor: '#FEF2F2',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '15px'
  },
  navLinkUser: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    textDecoration: 'none',
    color: '#4F46E5',
    fontWeight: '600',
    backgroundColor: '#EEF2FF',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '15px'
  },
  connectBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    backgroundColor: '#F6851B', // Màu cam đặc trưng của MetaMask
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    transition: 'opacity 0.2s',
    boxShadow: '0 4px 6px -1px rgba(246, 133, 27, 0.2)'
  },
  connectedBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    fontSize: '15px',
    fontWeight: '700',
    backgroundColor: '#D1FAE5',
    color: '#065F46',
    borderRadius: '10px',
    border: '1px solid #A7F3D0'
  }
};

export default App;