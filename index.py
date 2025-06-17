from flask import Flask, render_template, redirect, url_for, session, flash, request, jsonify
from admin_bp import admin_bp
from faculty import faculty
import os
import time
import uuid
import json
from datetime import datetime # <-- ĐÃ THÊM: Import datetime

app = Flask(__name__)
app.secret_key = '78c4a1b0d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2'

# Đăng ký Blueprint admin
app.register_blueprint(admin_bp)

# Đăng ký Blueprint faculty
app.register_blueprint(faculty)

# Đường dẫn đến tệp lưu trữ số lượt truy cập TỔNG (giờ sẽ là JSON)
VISITOR_COUNT_FILE = 'visitor_count.json' # <-- ĐÃ SỬA: Thay đổi tên file cho rõ ràng hơn là JSON
# Đường dẫn đến tệp lưu trữ người dùng ONLINE (tiếp tục là JSON)
ACTIVE_USERS_FILE = 'active_users.json'

# Thời gian hoạt động (ví dụ: 1 phút = 60 giây, hoặc 30 giây)
ACTIVE_THRESHOLD = 10 # Điều chỉnh theo định nghĩa "online" của bạn

# -- ĐÃ SỬA: Hàm để đọc/ghi dữ liệu lượt truy cập từ tệp JSON --
def load_visitor_data():
    if not os.path.exists(VISITOR_COUNT_FILE) or os.stat(VISITOR_COUNT_FILE).st_size == 0:
        # Nếu file không tồn tại hoặc rỗng, tạo dữ liệu ban đầu
        return {"count": 0, "last_reset_date": datetime.now().strftime("%Y-%m-%d")}
    with open(VISITOR_COUNT_FILE, 'r') as f:
        try:
            data = json.load(f)
            # Đảm bảo cấu trúc dữ liệu đúng
            if "count" not in data or "last_reset_date" not in data:
                return {"count": 0, "last_reset_date": datetime.now().strftime("%Y-%m-%d")}
            return data
        except json.JSONDecodeError:
            # Xử lý nếu file bị hỏng hoặc không đúng định dạng JSON
            return {"count": 0, "last_reset_date": datetime.now().strftime("%Y-%m-%d")}

def save_visitor_data(data):
    with open(VISITOR_COUNT_FILE, 'w') as f:
        json.dump(data, f)

# Hàm để đọc/ghi người dùng ONLINE từ tệp JSON
def load_active_users():
    if not os.path.exists(ACTIVE_USERS_FILE) or os.stat(ACTIVE_USERS_FILE).st_size == 0:
        return {}
    with open(ACTIVE_USERS_FILE, 'r') as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return {}

def save_active_users(users_dict):
    with open(ACTIVE_USERS_FILE, 'w') as f:
        json.dump(users_dict, f)

active_users = load_active_users()


# Trang chủ và đăng nhập
@app.route('/')
def index():
    # -- ĐÃ SỬA: Logic đếm lượt truy cập theo ngày --
    visitor_data = load_visitor_data()
    today_str = datetime.now().strftime("%Y-%m-%d")

    # Kiểm tra nếu đã sang ngày mới
    if visitor_data["last_reset_date"] != today_str:
        visitor_data["count"] = 0 # Reset bộ đếm
        visitor_data["last_reset_date"] = today_str # Cập nhật ngày reset

    # Tăng bộ đếm cho lượt truy cập hiện tại
    visitor_data["count"] += 1
    save_visitor_data(visitor_data) # Lưu lại dữ liệu đã cập nhật

    # Đảm bảo mỗi phiên có một ID duy nhất để theo dõi người dùng online
    if 'session_id_custom' not in session:
        session['session_id_custom'] = str(uuid.uuid4())

    return render_template('index.html')

@app.route('/get_counts')
def get_counts():
    global active_users

    session_id_custom = session.get('session_id_custom')

    if session_id_custom:
        active_users[session_id_custom] = time.time()
        save_active_users(active_users)

    current_time = time.time()
    users_to_remove = []
    for sid, timestamp in list(active_users.items()):
        if (current_time - timestamp) > ACTIVE_THRESHOLD:
            users_to_remove.append(sid)

    for sid in users_to_remove:
        if sid in active_users:
            del active_users[sid]

    save_active_users(active_users)

    # Lấy số lượt truy cập tổng từ file JSON
    total_visitors_data = load_visitor_data()
    total_visitors = total_visitors_data["count"] # Lấy 'count' từ dữ liệu JSON

    online_users = len(active_users)

    return jsonify(total_visitors=total_visitors, online_users=online_users)

# ... (Giữ nguyên tất cả các route và dữ liệu khác của bạn bên dưới) ...
@app.route('/dangnhap')
def dangnhap():
    return render_template('dangnhap.html')

@app.route('/cong-nghe-thong-tin')
def cntt():
    return render_template('nganhhoc/cntt.html')

@app.route('/luat-dich-vu-phap-ly')
def dichvuphaply():
    return render_template('nganhhoc/dichvuphaply.html')

@app.route('/dieu-duong')
def dieuduong():
    return render_template('nganhhoc/dieuduong.html')

@app.route('/du-lich')
def dulich():
    return render_template('nganhhoc/dulich.html')

@app.route('/y')
def duoc():
    return render_template('nganhhoc/duoc.html')

@app.route('/ke-toan-doanh-nghiep')
def ketoan():
    return render_template('nganhhoc/ketoan.html')

@app.route('/logistic')
def logistics():
    return render_template('nganhhoc/logistics.html')

@app.route('/mamnon')
def mamnon():
    return render_template('nganhhoc/mamnon.html')

@app.route('/ngon-ngu-anh')
def ngonnguanh():
    return render_template('nganhhoc/ngonnguanh.html')

@app.route('/cong-nghe-o-to')
def oto():
    return render_template('nganhhoc/oto.html')

@app.route('/ky-thuat-phuc-hoi-chuc-nang-vat-ly-tri-lieu')
def phuchoichucnang():
    return render_template('nganhhoc/phuchoichucnang.html')

@app.route('/ky-thuat-phuc-hinh-rang-ham-mat')
def phuchoirang():
    return render_template('nganhhoc/phuchoirang.html')

@app.route('/quan-tri-kinh-doanh')
def quantrikinhdoanh():
    return render_template('nganhhoc/quantrikinhdoanh.html')

@app.route('/tai-chinh-ngan-hang')
def taichinhnganhang():
    return render_template('nganhhoc/taichinhnganhang.html')

@app.route('/thpt9')
def thpt9():
    return render_template('nganhhoc/thpt9.html')

@app.route('/cong-nghe-thuc-pham')
def thucpham():
    return render_template('nganhhoc/thucpham.html')

@app.route('/thuong-mai-dien-tu')
def thuongmaidientu():
    return render_template('nganhhoc/thuongmaidientu.html')

@app.route('/thu-y')
def thuy():
    return render_template('nganhhoc/thuy.html')

@app.route('/y-hoc-co-truyen')
def yhoccotruyen():
    return render_template('nganhhoc/yhoccotruyen.html')

@app.route('/y-si-da-khoa')
def ysi():
    return render_template('nganhhoc/ysi.html')


@app.route('/private_policy')
def private_policy():
    return render_template('private_policy.html')

@app.route('/profile')
def profile():
    return render_template('profile.html')

@app.route('/dangki')
def dangki():
    return render_template('dangki.html')

@app.route('/about')
def vechungtoi():
    return render_template('vechungtoi.html')

@app.route('/vision')
def tamnhinsumenh():
    return render_template('tamnhinsumenh.html')

@app.route('/facilities')
def facilities():
    return render_template('cosovatchat.html')

@app.route('/lich')
def lich():
    return render_template('lich.html')

@app.route('/admission')
def admission():
    return render_template('tt-tuyensinh.html')

@app.route('/cao-dang-chinh-quy')
def caodangchinhquy():
    return render_template('caodang.html')

@app.route('/phothong-cao-dang-9')
def thptchinhquy():
    return render_template('phothong9+.html')

@app.route('/lien-thong-van-bang-2-cao-dang')
def lienthongvanbang2caodang():
    return render_template('vanbang2caodang.html')

@app.route('/lien-thong-van-bang-2-dai-hoc')
def lienthongvanbangdaihoc():
    return render_template('vanbang2daihoc.html')

@app.route('/hoatdongtuvan')
def hoatdongtuvan():
    return render_template('tintuctuyensinh.html')

@app.route('/tintucgiaoduc')
def tintucgiaoduc():
    return render_template('tintucgiaoduc.html')

@app.route('/phongtraosinhvien')
def phongtraosinhvien():
    return render_template('phongtraosinhvien.html')

@app.route('/camnang')
def camnang():
    return render_template('camnang.html')

@app.route('/contact')
def lienhe():
    return render_template('lienhe.html')


@app.route('/kinh-te-tai-chinh')
def kinhtetaichinh():
    return render_template('kinhte-taichinh.html')

@app.route('/thu-y-chan-nuoi')
def thuychannuoi():
    return render_template('thuy.html')

@app.route('/cong-nghe-ky-thuat')
def cnkt():
    return render_template('congnghekithuat.html')

@app.route('/y-duoc')
def yduoc():
    return render_template('y-duoc.html')

@app.route('/xa-hoi-du-lich-phap-luat')
def xhdlpl():
    return render_template('xh-dl-pl.html')

@app.route('/student-services')
def dichvusv():
    return render_template('dichvusv.html')

@app.route('/dang-ky-bang-diem')
def dangkybangdiem():
    return render_template('dichvu/dvbangdiem.html')

@app.route('/dang-ky-chung-nhan')
def dangkychungnhan():
    return render_template('dichvu/dvchungnhansv.html')

@app.route('/dang-ky-the-sinh-vien')
def dangkythesinhvien():
    return render_template('dichvu/dvthesv.html')

@app.route('/dang-ky-xac-nhan-vay-von')
def dangkyvayvon():
    return render_template('dichvu/dvvayvon.html')

@app.route('/dang-ky-ban-sao-bang-tot-nghiep')
def dangkybansaobtn():
    return render_template('dichvu/dvbansaobtn.html')

@app.route('/huong-dan')
def huongdan():
    return render_template('huong-dan.html')

teachers_data = [
    {
        "id": 1,
        "name": "PGS. TS. Nguyễn Văn A",
        "university": "Đại học Bách Khoa TP.HCM",
        "avgRating": 4.8,
        "totalReviews": 120,
        "description": "Chuyên gia về Trí tuệ nhân tạo và Học máy. Giảng viên có kinh nghiệm lâu năm, phương pháp giảng dạy hiện đại, luôn cập nhật kiến thức mới và khuyến khích sinh viên tư duy phản biện.",
        "imageUrl": "/static/images/giangvien/1.jpg"
    },
    {
        "id": 2,
        "name": "ThS. Trần Thị B",
        "university": "Đại học Khoa học Tự nhiên TP.HCM",
        "avgRating": 4.2,
        "totalReviews": 85,
        "description": "Giảng viên môn Lập trình Web và Phát triển Ứng dụng Di động. Cô B rất nhiệt tình, giải đáp mọi thắc mắc của sinh viên và có nhiều bài tập thực hành sát với thực tế.",
        "imageUrl": "/static/images/giangvien/2.jpg"
    },
    {
            "id": 3,
            "name": "TS. Lê Thanh C",
            "university": "Đại học Kinh tế TP.HCM",
            "avgRating": 4.5,
            "totalReviews": 95,
            "description": "Chuyên ngành Tài chính và Đầu tư. Thầy C có phong cách giảng dạy lôi cuốn, cung cấp nhiều case study thú vị, giúp sinh viên hiểu rõ hơn về thị trường tài chính.",
            "imageUrl": "/static/images/giangvien/3.jpg"
        },
        {
            "id": 4,
            "name": "ThS. Phạm Ngọc D",
            "university": "Đại học Sư phạm TP.HCM",
            "avgRating": 4.0,
            "totalReviews": 70,
            "description": "Giảng viên môn Phương pháp giảng dạy và Tâm lý học giáo dục. Cô D rất tận tâm với sinh viên, truyền đạt kiến thức một cách dễ hiểu và luôn tạo không khí học tập thoải mái.",
            "imageUrl": "/static/images/giangvien/4.jpg"
        }
]

reviews_data = [
    {"id": 1, "teacherId": 1, "stars": 5, "comment": "Thầy A giảng bài rất dễ hiểu...", "date": "10/05/2024", "reviewer": "Sinh viên K20"},
    {"id": 2, "teacherId": 1, "stars": 3, "comment": "Nội dung bài giảng hơi nặng...", "date": "01/03/2024", "reviewer": "Sinh viên K19"},
    {"id": 3, "teacherId": 2, "stars": 4, "comment": "Cô B rất tận tâm...", "date": "22/04/2024", "reviewer": "Sinh viên K21"},
]

def get_stars_html(rating):
    full_stars = int(rating)
    half_star = '&#9733;' if rating % 1 >= 0.5 else ''
    empty_stars = 5 - full_stars - (1 if half_star else 0)
    return '★' * full_stars + half_star + '☆' * empty_stars

app.jinja_env.globals.update(get_stars_html=get_stars_html)

@app.route('/dichvu/gv')
def indexgv():
    return render_template('dichvu/gv/index.html', teachers=teachers_data)

@app.route('/teacher/<int:teacher_id>')
def teacher_detail(teacher_id):
    teacher = next((t for t in teachers_data if t["id"] == teacher_id), None)
    if teacher:
        teacher_reviews = [r for r in reviews_data if r["teacherId"] == teacher_id]
        return render_template('dichvu/gv/teacher-detail.html', teacher=teacher, reviews=teacher_reviews)
    return "Giảng viên không tìm thấy", 404


facilities_data = [
    {
        "id": 1,
        "name": "Phòng học & Giảng đường",
        "description": "Các phòng học và giảng đường hiện đại, trang bị đầy đủ máy chiếu, điều hòa và hệ thống âm thanh tốt. Sức chứa đa dạng.",
        "avgRating": 4.5,
        "totalReviews": 90,
        "imageUrl": "/static/images/csvc/phoc.jpg"
    },
    {
        "id": 2,
        "name": "Phòng tin học",
        "description": "Phòng tin học trung tâm với hàng ngàn đầu sách, tài liệu nghiên cứu đa ngành. Không gian yên tĩnh, có khu vực học nhóm và máy tính.",
        "avgRating": 4.7,
        "totalReviews": 150,
        "imageUrl": "/static/images/csvc/phongmay.jpg"
    },
    {
        "id": 3,
        "name": "Phòng thí nghiệm (Lab)",
        "description": "Các phòng lab chuyên biệt được trang bị thiết bị hiện đại phục vụ nghiên cứu khoa học và thực hành cho sinh viên các khối ngành kỹ thuật, tự nhiên.",
        "avgRating": 4.3,
        "totalReviews": 75,
        "imageUrl": "/static/images/csvc/lab.jpg"
    },
    {
        "id": 4,
        "name": "Ký túc xá",
        "description": "Ký túc xá hiện đại, an toàn với nhiều loại phòng. Có đầy đủ tiện nghi như căng tin, phòng giặt, khu vực sinh hoạt chung.",
        "avgRating": 3.9,
        "totalReviews": 110,
        "imageUrl": "/static/images/csvc/ktx.jpg"
    },
    {
        "id": 5,
        "name": "Canteen & Khu ăn uống",
        "description": "Nhiều lựa chọn ẩm thực phong phú với giá cả phải chăng. Đảm bảo vệ sinh an toàn thực phẩm.",
        "avgRating": 4.0,
        "totalReviews": 80,
        "imageUrl": "/static/images/csvc/cartin.jpg"
    },
    {
        "id": 6,
        "name": "Sân thể thao",
        "description": "Đa dạng các sân thể thao (bóng đá, bóng chuyền, bóng rổ, cầu lông...) phục vụ nhu cầu rèn luyện thể chất của sinh viên.",
        "avgRating": 4.2,
        "totalReviews": 65,
        "imageUrl": "/static/images/csvc/santhethao2.jpg"
    }
]

facility_reviews_data = [
    {"id": 101, "facilityId": 1, "stars": 5, "comment": "Phòng học rất mới và sạch sẽ, có điều hòa mát mẻ, học rất thoải mái.", "date": "05/06/2025", "reviewer": "SV K23"},
    {"id": 102, "facilityId": 1, "stars": 4, "comment": "Giảng đường lớn nhưng đôi khi loa hơi rè một chút. Tổng thể vẫn ổn.", "date": "01/06/2025", "reviewer": "SV K22"},
    {"id": 103, "facilityId": 2, "stars": 5, "comment": "Thư viện quá tuyệt vời, không gian yên tĩnh, tài liệu phong phú, có đủ chỗ cho mọi người.", "date": "10/06/2025", "reviewer": "SV K24"},
    {"id": 104, "facilityId": 3, "stars": 4, "comment": "Phòng lab được trang bị tốt, nhưng đôi khi hơi thiếu chỗ ngồi thực hành vào giờ cao điểm.", "date": "08/06/2025", "reviewer": "SV K21"},
    {"id": 105, "facilityId": 4, "stars": 3, "comment": "Ký túc xá khá ổn, nhưng internet đôi khi không ổn định. Vệ sinh chung thì tốt.", "date": "03/06/2025", "reviewer": "SV K23"},
    {"id": 106, "facilityId": 5, "stars": 4, "comment": "Canteen nhiều món ngon, giá cả hợp lý. Hơi đông vào giờ ăn trưa.", "date": "06/06/2025", "reviewer": "SV K22"},
    {"id": 107, "facilityId": 6, "stars": 5, "comment": "Sân thể thao đa dạng, sạch đẹp. Rất thích không gian này để tập luyện.", "date": "09/06/2025", "reviewer": "SV K24"},
]

@app.route('/dichvu/cosovatchat')
def facility_index():
    return render_template('dichvu/csvc/index.html', facilities=facilities_data)

@app.route('/facility/<int:facility_id>')
def facility_detail(facility_id):
    facility = next((f for f in facilities_data if f["id"] == facility_id), None)
    if facility:
        current_facility_reviews = [r for r in facility_reviews_data if r["facilityId"] == facility_id]
        return render_template('dichvu/csvc/facility_detail.html', facility=facility, reviews=current_facility_reviews)
    return "Hạng mục cơ sở vật chất không tìm thấy", 404

@app.route('/api/facility/<int:facility_id>/reviews', methods=['POST'])
def add_facility_review(facility_id):
    if request.is_json:
        data = request.get_json()
        stars = data.get('stars')
        comment = data.get('comment')

        if not all([stars, comment]):
            return {"error": "Missing data"}, 400

        print(f"Received review for facility {facility_id}: Stars={stars}, Comment='{comment}'")

        return {"message": "Đánh giá cơ sở vật chất đã được tiếp nhận (chưa lưu vào DB)", "review": {"stars": stars, "comment": comment}}, 201
    return {"error": "Request must be JSON"}, 400

@app.route('/events')
def sukien():
    return render_template('sukien.html')

@app.route('/careers')
def tuyendung():
    return render_template('tuyendung.html')

@app.route('/bangdiem')
def bandiem():
    return render_template('/dichvu/tibangdiem.html')

@app.route('/thoikhoabieu')
def tkb():
    return render_template('/dichvu/tithoikhoabieu.html')

@app.route('/dich-vu-da-dang-ky')
def dadangki():
    return render_template('/dichvu/dvdadangki.html')


@app.route('/hoc-tap')
def study_home():
    return render_template('hoctap/study_majors.html')

@app.route('/hoc-tap/nganh/<major_id>')
def major_detail_page(major_id):
    return render_template('hoctap/major_detail.html', major_id=major_id)

@app.route('/hoc-tap/mon-hoc/<course_id>')
def course_detail_page(course_id):
    return render_template('hoctap/course_detail.html', course_id=course_id)


if __name__ == '__main__':
    # Khởi tạo file visitor_count.json nếu chưa có
    if not os.path.exists(VISITOR_COUNT_FILE):
        # Tạo dữ liệu ban đầu với ngày hiện tại và số đếm 0
        initial_data = {"count": 0, "last_reset_date": datetime.now().strftime("%Y-%m-%d")}
        with open(VISITOR_COUNT_FILE, 'w') as f:
            json.dump(initial_data, f)
    # Khởi tạo file active_users.json nếu chưa có
    if not os.path.exists(ACTIVE_USERS_FILE):
        with open(ACTIVE_USERS_FILE, 'w') as f:
            json.dump({}, f)
    app.run(debug=True)