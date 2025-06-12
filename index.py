from flask import Flask, render_template, redirect, url_for, session, flash, request
from admin_bp import admin_bp 

app = Flask(__name__)
app.secret_key = '78c4a1b0d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2' # Cần thiết cho session và flash messages

# Đăng ký Blueprint admin
app.register_blueprint(admin_bp)


# Trang chủ và đăng nhập
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/dangnhap')
def dangnhap():
    return render_template('dangnhap.html')

# (Giữ nguyên các route thông thường khác của bạn ở đây)
# Nhóm ngành Kinh tế - Quản trị
# 

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

# @app.route('/danh-gia-giang-vien')
# def danhgiagv():
#     return render_template('dichvu/gv/index.html')


# index.py (hoặc app.py)
     # Nếu bạn có thư mục static cho CSS/JS
# Dữ liệu giảng viên mẫu (trong thực tế sẽ lấy từ database)
teachers_data = [
    {
        "id": 1,
        "name": "PGS. TS. Nguyễn Văn A",
        "university": "Đại học Bách Khoa TP.HCM",
        "avgRating": 4.8,
        "totalReviews": 120,
        "description": "Chuyên gia về Trí tuệ nhân tạo và Học máy. Giảng viên có kinh nghiệm lâu năm, phương pháp giảng dạy hiện đại, luôn cập nhật kiến thức mới và khuyến khích sinh viên tư duy phản biện."
    },
    {
        "id": 2,
        "name": "ThS. Trần Thị B",
        "university": "Đại học Khoa học Tự nhiên TP.HCM",
        "avgRating": 4.2,
        "totalReviews": 85,
        "description": "Giảng viên môn Lập trình Web và Phát triển Ứng dụng Di động. Cô B rất nhiệt tình, giải đáp mọi thắc mắc của sinh viên và có nhiều bài tập thực hành sát với thực tế."
    },
    # ... thêm các giảng viên khác
]

# Dữ liệu đánh giá mẫu
reviews_data = [
    {"id": 1, "teacherId": 1, "stars": 5, "comment": "Thầy A giảng bài rất dễ hiểu...", "date": "10/05/2024", "reviewer": "Sinh viên K20"},
    {"id": 2, "teacherId": 1, "stars": 3, "comment": "Nội dung bài giảng hơi nặng...", "date": "01/03/2024", "reviewer": "Sinh viên K19"},
    {"id": 3, "teacherId": 2, "stars": 4, "comment": "Cô B rất tận tâm...", "date": "22/04/2024", "reviewer": "Sinh viên K21"},
]

# ĐỊNH NGHĨA HÀM get_stars_html Ở ĐÂY
def get_stars_html(rating):
    full_stars = int(rating) # Chuyển đổi thành số nguyên
    half_star = '&#9733;' if rating % 1 >= 0.5 else '' # Ký tự sao nửa, hoặc rỗng
    empty_stars = 5 - full_stars - (1 if half_star else 0)
    return '★' * full_stars + half_star + '☆' * empty_stars

# ĐĂNG KÝ HÀM VỚI MÔI TRƯỜNG JINJA2 CỦA FLASK
app.jinja_env.globals.update(get_stars_html=get_stars_html)

# Định tuyến cho trang chủ
@app.route('/dichvu/gv') # Nếu bạn có đường dẫn cụ thể
def indexgv():
    return render_template('dichvu/gv/index.html', teachers=teachers_data)

# Định tuyến cho trang chi tiết giảng viên
@app.route('/teacher/<int:teacher_id>')
def teacher_detail(teacher_id):
    teacher = next((t for t in teachers_data if t["id"] == teacher_id), None)
    if teacher:
        teacher_reviews = [r for r in reviews_data if r["teacherId"] == teacher_id]
        return render_template('dichvu/gv/teacher-detail.html', teacher=teacher, reviews=teacher_reviews)
    return "Giảng viên không tìm thấy", 404

if __name__ == '__main__':
    app.run(debug=True)