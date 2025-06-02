from flask import Blueprint, render_template, redirect, url_for, session, flash, request

# Tạo một Blueprint mới với tiền tố URL '/admin'
admin_bp = Blueprint('admin', __name__, url_prefix='/admin')


@admin_bp.route('/')
def admin_login():
   
    return render_template('admin/login_admin.html')


@admin_bp.route('/home')
def admin_home():
    
    return render_template('admin/home_admin.html')

@admin_bp.route('/advisory-registrations/')
def admin_advisory_registrations():
    """
    Trang xem các lượt đăng ký tư vấn
    """
    return render_template('admin/admin_registrations.html')


@admin_bp.route('/stats-traffic/')
def count_traffic():
    """
    Trang xem các lượt truy cập vào web
    """
    return render_template('admin/stats.html')

@admin_bp.route('/stats-traffic/')
def count_registration():
    """
    Trang xem các lượt truy cập vào web
    """
    return render_template('admin/admin_stats_registration.html')

