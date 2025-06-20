// duLieuTro02.js
const duLieuPhongTro02 = [
    {
        id: 'PT001',
        anhDaiDien: '/static/images/ktx/1/p1.jpg',
        tieuDe: 'Phòng trọ tiện nghi gần Đại học Bách Khoa',
        gia: '3.500.000 VNĐ/tháng',
        kichThuoc: '25m²',
        conPhong: true,
        diaChiNganGon: 'Quận 10, TP.HCM',
        // Thông tin chi tiết
        anhChiTiet: [
           '/static/images/ktx/1/p1.jpg',
           '/static/images/ktx/1/p2.jpg'
        ],
        moTaChiTiet: 'Phòng trọ mới xây, có ban công thoáng mát, đầy đủ nội thất cơ bản: giường, tủ, bàn học. Gần chợ, siêu thị và các tuyến xe buýt lớn. Khu vực an ninh, yên tĩnh, phù hợp cho sinh viên và người đi làm. Chỉ cách Đại học Bách Khoa 5 phút xe máy.',
        thongTinLienHe: {
            ten: 'Anh/Chị Chủ nhà A',
            sdt: '0901234567',
            email: 'chuanhaA@example.com'
        },
        dacDiemPhongTro: [
            'Có máy lạnh', 'Nước nóng năng lượng mặt trời', 'WC riêng trong phòng', 'Chỗ để xe miễn phí',
            'Giờ giấc tự do', 'Có bếp nhỏ', 'Wifi tốc độ cao'
        ],
        viTriTro: 'Số 123, Đường ABC, Phường 1, Quận 10, TP.HCM (Gần trường Đại học Bách Khoa)',
        noiQuyCam: [
            'Không hút thuốc trong phòng', 'Không nuôi thú cưng', 'Không tụ tập bạn bè quá 22h', 'Không sử dụng chất cấm'
        ]
    },
    {
        id: 'PT002',
        anhDaiDien:  '/static/images/ktx/2/p1.jpg',
        tieuDe: 'Studio hiện đại Quận Gò Vấp',
        gia: '4.200.000 VNĐ/tháng',
        kichThuoc: '30m²',
        conPhong: true,
        diaChiNganGon: 'Quận Gò Vấp, TP.HCM',
        anhChiTiet: [
             '/static/images/ktx/2/p1.jpg',
            '/static/images/ktx/2/p2.jpg',
             '/static/images/ktx/2/p3.jpg'
        ],
        moTaChiTiet: 'Phòng studio full nội thất, thiết kế trẻ trung hiện đại. Có thang máy, bảo vệ 24/7. Khu dân cư trí thức, gần công viên, trung tâm thương mại. Thuận tiện di chuyển đến các trường đại học khu vực Gò Vấp, Bình Thạnh.',
        thongTinLienHe: {
            ten: 'Cô Chủ nhà B',
            sdt: '0912345678',
            email: 'chuanhaB@example.com'
        },
        dacDiemPhongTro: [
            'Full nội thất', 'Thang máy', 'Bảo vệ 24/7', 'WC riêng', 'Bếp riêng', 'Giờ giấc tự do'
        ],
        viTriTro: '25 Nguyễn Oanh, Phường 10, Quận Gò Vấp, TP.HCM',
        noiQuyCam: [
            'Không mang xe vào phòng', 'Không gây ồn ào sau 23h'
        ]
    },
    {
        id: 'PT003',
        anhDaiDien: '/static/images/ktx/2/p3.jpg',
        tieuDe: 'Phòng trọ giá rẻ cho sinh viên Thủ Đức',
        gia: '2.000.000 VNĐ/tháng',
        kichThuoc: '18m²',
        conPhong: false, // Hết phòng
        diaChiNganGon: 'TP. Thủ Đức, TP.HCM',
        anhChiTiet: [
            '/static/images/ktx/2/p3.jpg',
            'https://via.placeholder.com/800x600/003FFF/FFFFFF?text=Chi+Tiet+02'
        ],
        moTaChiTiet: 'Phòng sạch sẽ, thoáng mát, khu vực an ninh. Thích hợp cho sinh viên muốn tiết kiệm chi phí. Gần Làng Đại học Quốc gia TP.HCM. Có chỗ để xe, không có máy lạnh.',
        thongTinLienHe: {
            ten: 'Bác Chủ nhà C',
            sdt: '0987654321',
            email: 'chuanhaC@example.com'
        },
        dacDiemPhongTro: [
            'WC chung (1WC cho 2 phòng)', 'Chỗ để xe', 'Giờ giấc linh hoạt', 'Điện nước giá dân'
        ],
        viTriTro: '12 Đường số 1, Phường Linh Trung, TP. Thủ Đức, TP.HCM (Gần KTX ĐHQG)',
        noiQuyCam: [
            'Giữ gìn vệ sinh chung', 'Không làm ồn'
        ]
    }
    // Thêm các phòng trọ khác vào đây
];