from flask import Blueprint, render_template, redirect, url_for, session, flash, request

sinhvien = Blueprint('sinhvien', __name__, url_prefix='/sinhvien')


@sinhvien.route('/dichvu')
def dichvu():
   
    return render_template('page_sinh_vien/dichvusv.html')

@sinhvien.route('')
def tongquan():
   
    return render_template('page_sinh_vien/tongquan.html')

@sinhvien.route('/taikhoan')
def taikhoan():
   
    return render_template('page_sinh_vien/taikhoan.html')

@sinhvien.route('/hoctap')
def hoctap():
   
    return render_template('hoctap/study_majors.html')





