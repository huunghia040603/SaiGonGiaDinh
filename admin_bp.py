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
 
    return render_template('admin/admin_registrations.html')


@admin_bp.route('/stats-traffic/')
def count_traffic():
    
    return render_template('admin/stats.html')

@admin_bp.route('/stats-traffic/')
def count_registration():
    
    return render_template('admin/admin_stats_registration.html')

@admin_bp.route('/create_account/')
def create_account():
    
    return render_template('admin/create_account.html')


@admin_bp.route('/manage_account_student/')
def manage_account_student():
    
    return render_template('admin/manage_account_student.html')

@admin_bp.route('/manage_account_faculty/')
def manage_account_faculty():
    
    return render_template('admin/manage_account_faculty.html')


@admin_bp.route('/manage_news/')
def manage_news():
    
    return render_template('admin/admin_news.html')





