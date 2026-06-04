// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TicketNFT {
    string public name = "CryptoTicket";
    string public symbol = "CTK";
    
    address public owner; 
    uint256 public nextTicketId; 
    uint256 public nextEventId;  

    struct Event {
        uint256 maxTickets;   
        uint256 ticketsSold;  
        uint256 price;        
        bool isActive;        
    }

    mapping(uint256 => Event) public events;                 
    mapping(uint256 => address) private _owners;             
    mapping(address => uint256) private _balances;           
    mapping(uint256 => uint256) public ticketToEvent;        
    mapping(uint256 => bool) public isUsed;                  
    mapping(address => mapping(uint256 => uint256)) public userTicketCount; 

    uint256 public constant MAX_PER_USER = 2; 

    event EventCreated(uint256 indexed eventId, uint256 maxTickets, uint256 price);
    event TicketPurchased(uint256 indexed ticketId, uint256 indexed eventId, address indexed buyer);
    event TicketUsed(uint256 indexed ticketId);

    modifier onlyOwner() {
        require(msg.sender == owner, "Chi co Ban to chuc moi co quyen");
        _;
    }

    constructor() {
        owner = msg.sender; 
    }

    function createEvent(uint256 _maxTickets, uint256 _priceInWei) external onlyOwner {
        require(_maxTickets > 0, "So luong phai > 0");
        nextEventId++;
        events[nextEventId] = Event(_maxTickets, 0, _priceInWei, true);
        emit EventCreated(nextEventId, _maxTickets, _priceInWei);
    }

    function buyTicket(uint256 _eventId, uint256 _quantity) external payable {
        require(_quantity > 0, "So luong phai lon hon 0");
        Event storage myEvent = events[_eventId];
        require(myEvent.isActive, "Su kien dang tam dung");
        
        // Kiểm tra xem số lượng mua có vượt quá số vé còn lại không
        require(myEvent.ticketsSold + _quantity <= myEvent.maxTickets, "Khong du ve de ban");
        
        // Giá tiền phải bằng = Giá 1 vé * Số lượng
        require(msg.value == myEvent.price * _quantity, "Thanh toan sai so tien");
        
        // Tổng số vé đã có + Số vé đang mua không được vượt quá MAX_PER_USER (2 vé)
        require(userTicketCount[msg.sender][_eventId] + _quantity <= MAX_PER_USER, "Vuot qua gioi han ve");

        // Vòng lặp in vé theo số lượng
        for(uint256 i = 0; i < _quantity; i++) {
            nextTicketId++;
            _owners[nextTicketId] = msg.sender;
            ticketToEvent[nextTicketId] = _eventId;
            emit TicketPurchased(nextTicketId, _eventId, msg.sender);
        }

        // Cập nhật lại tổng số liệu
        myEvent.ticketsSold += _quantity;
        userTicketCount[msg.sender][_eventId] += _quantity;
        _balances[msg.sender] += _quantity;
    }

    function transferFrom(address from, address to, uint256 tokenId) external pure {
        revert("Ve NFT da bi khoa chuyen nhuong de chong phe ve");
    }

    function verifyTicket(uint256 _ticketId) external view returns (address ticketOwner, uint256 eventId, bool used) {
        address currentOwner = _owners[_ticketId];
        require(currentOwner != address(0), "Ve khong ton tai");
        return (currentOwner, ticketToEvent[_ticketId], isUsed[_ticketId]);
    }

    function markAsUsed(uint256 _ticketId) external {
        require(_owners[_ticketId] != address(0), "Ve khong hop le");
        require(!isUsed[_ticketId], "Ve da duoc su dung");
        isUsed[_ticketId] = true;
        emit TicketUsed(_ticketId);
    }

    function ownerOf(uint256 tokenId) external view returns (address) {
        address currentOwner = _owners[tokenId];
        require(currentOwner != address(0), "Ve khong ton tai");
        return currentOwner;
    }
}