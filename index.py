# from flask import Flask, render_template

# app = Flask(__name__)

# # Trang chủ và đăng nhập
# @app.route('/')
# def index():
#     return render_template('index.html')

# @app.route('/dangnhap')
# def dangnhap():
#     return render_template('dangnhap.html')

# # Nhóm ngành Kinh tế - Quản trị
# @app.route('/ketoan')
# def ketoan():
#     return render_template('nganh/ketoan.html')
    
# @app.route('/quantrikinhdoanh')
# def quantrikinhdoanh():
#     return render_template('nganh/quantrikinhdoanh.html')

# @app.route('/taichinh')
# def taichinh():
#     return render_template('nganh/taichinh.html')

# @app.route('/thuongmaidientu')
# def thuongmaidientu():
#     return render_template('nganh/thuongmaidientu.html')

# @app.route('/logistics')
# def logistics():
#     return render_template('nganh/logistics.html')

# # Nhóm ngành Công nghệ thông tin
# @app.route('/congnghe')
# def congnghe():
#     return render_template('nganh/congnghe.html')

# @app.route('/csdl')
# def csdl():
#     return render_template('nganh/csdl.html')

# @app.route('/dohoa')
# def dohoa():
#     return render_template('nganh/dohoa.html')

# @app.route('/laptrinh')
# def laptrinh():
#     return render_template('nganh/laptrinh.html')

# # Nhóm ngành Công nghệ - Kỹ thuật
# @app.route('/oto')
# def oto():
#     return render_template('nganh/oto.html')

# @app.route('/thucpham')
# def thucpham():
#     return render_template('nganh/thucpham.html')

# # Nhóm ngành Y - Dược
# @app.route('/duoc')
# def duoc():
#     return render_template('nganh/duoc.html')

# @app.route('/dieuduong')
# def dieuduong():
#     return render_template('nganh/dieuduong.html')

# @app.route('/ysi')
# def ysi():
#     return render_template('nganh/ysi.html')

# @app.route('/rang')
# def rang():
#     return render_template('nganh/rang.html')

# @app.route('/phuchoi')
# def phuchoi():
#     return render_template('nganh/phuchoi.html')

# @app.route('/yhct')
# def yhct():
#     return render_template('nganh/yhct.html')

# # Nhóm ngành Du lịch
# @app.route('/dulich')
# def dulich():
#     return render_template('nganh/dulich.html')

# @app.route('/huongdan')
# def huongdan():
#     return render_template('nganh/huongdan.html')

# @app.route('/nhahang')
# def nhahang():
#     return render_template('nganh/nhahang.html')

# # Nhóm ngành mới thêm
# @app.route('/ngoaingu')
# def ngoaingu():
#     return render_template('nganh/ngoaingu.html')

# @app.route('/luat')
# def luat():
#     return render_template('nganh/luat.html')

# @app.route('/mamnon')
# def mamnon():
#     return render_template('nganh/mamnon.html')

# @app.route('/vanhoa')
# def vanhoa():
#     return render_template('nganh/vanhoa.html')

# @app.route('/private_policy')
# def private_policy():
#     return render_template('private_policy.html')

# @app.route('/profile')
# def profile():
#     return render_template('profile.html')


# if __name__ == '__main__':
#     app.run(debug=True)



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
@app.route('/ketoan')
def ketoan():
    return render_template('nganh/ketoan.html')

@app.route('/quantrikinhdoanh')
def quantrikinhdoanh():
    return render_template('nganh/quantrikinhdoanh.html')

@app.route('/taichinh')
def taichinh():
    return render_template('nganh/taichinh.html')

@app.route('/thuongmaidientu')
def thuongmaidientu():
    return render_template('nganh/thuongmaidientu.html')

@app.route('/logistics')
def logistics():
    return render_template('nganh/logistics.html')

# Nhóm ngành Công nghệ thông tin
@app.route('/congnghe')
def congnghe():
    return render_template('nganh/congnghe.html')

@app.route('/csdl')
def csdl():
    return render_template('nganh/csdl.html')

@app.route('/dohoa')
def dohoa():
    return render_template('nganh/dohoa.html')

@app.route('/laptrinh')
def laptrinh():
    return render_template('nganh/laptrinh.html')

# Nhóm ngành Công nghệ - Kỹ thuật
@app.route('/oto')
def oto():
    return render_template('nganh/oto.html')

@app.route('/thucpham')
def thucpham():
    return render_template('nganh/thucpham.html')

# Nhóm ngành Y - Dược
@app.route('/duoc')
def duoc():
    return render_template('nganh/duoc.html')

@app.route('/dieuduong')
def dieuduong():
    return render_template('nganh/dieuduong.html')

@app.route('/ysi')
def ysi():
    return render_template('nganh/ysi.html')

@app.route('/rang')
def rang():
    return render_template('nganh/rang.html')

@app.route('/phuchoi')
def phuchoi():
    return render_template('nganh/phuchoi.html')

@app.route('/yhct')
def yhct():
    return render_template('nganh/yhct.html')

# Nhóm ngành Du lịch
@app.route('/dulich')
def dulich():
    return render_template('nganh/dulich.html')

@app.route('/huongdan')
def huongdan():
    return render_template('nganh/huongdan.html')

@app.route('/nhahang')
def nhahang():
    return render_template('nganh/nhahang.html')

# Nhóm ngành mới thêm
@app.route('/ngoaingu')
def ngoaingu():
    return render_template('nganh/ngoaingu.html')

@app.route('/luat')
def luat():
    return render_template('nganh/luat.html')

@app.route('/mamnon')
def mamnon():
    return render_template('nganh/mamnon.html')

@app.route('/vanhoa')
def vanhoa():
    return render_template('nganh/vanhoa.html')

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

@app.route('/nganh')
def  nganh():
    return render_template('nganh.html')

@app.route('/facilities')
def cosovatchat():
    return render_template('cosovatchat.html')

@app.route('/lich')
def lich():
    return render_template('lich.html')

@app.route('/admission')
def tt_tuyensinh():
    return render_template('tt-tuyensinh.html')

if __name__ == '__main__':
    app.run(debug=True)