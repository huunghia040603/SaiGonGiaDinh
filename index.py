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

@app.route('/y-sy-da-khoa')
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

if __name__ == '__main__':
    app.run(debug=True)