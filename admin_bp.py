from flask import Blueprint, render_template, redirect, url_for, session, flash, request

# Tạo một Blueprint mới với tiền tố URL '/admin'
admin_bp = Blueprint('admin', __name__, url_prefix='/sggd/qtv/admin')


@admin_bp.route('/')
def admin_login():
   
    return render_template('admin/login_admin.html')


@admin_bp.route('/home/')
def admin_home():
    
    return render_template('admin/home_admin.html')

@admin_bp.route('/advisory-registrations/')
def admin_advisory_registrations():
 
    return render_template('admin/admin_registrations.html')


@admin_bp.route('/stats-traffic/')
def count_traffic():
    
    return render_template('admin/stats.html')

@admin_bp.route('/IPSummary/')
def ip_summary():
    
    return render_template('admin/admin_ip_summary.html')


@admin_bp.route('/IPDetail/')
def ip_detail():
    
    return render_template('admin/admin_ip_detail.html')

@admin_bp.route('/stats-registration/')
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

@admin_bp.route('/locked_account/')
def locked_account():
 
    return render_template('admin/admin_locked_account.html')

@admin_bp.route('/notifications/')
def notifications():
 
    return render_template('admin/admin_notifications.html')


@admin_bp.route('/manage_nganh/')
def manage_nganh():
    
    return render_template('admin/manage_nganh.html')



@admin_bp.route('/create_schedule/')
def schedule():
    
    return render_template('admin/schedule.html')



@admin_bp.route('/edit_banner/')
def edit_banner():
    
    return render_template('admin/edit_banner.html')


@admin_bp.route('/dangkynhaphoc/')
def dangkynhaphoc():
    
    return render_template('admin/dangkynhaphoc.html')


@admin_bp.route('/create_noti/')
def createNoti():
    
    return render_template('admin/admin_create_notifications.html')

@admin_bp.route('/edit_noti/')
def editNoti():
    
    return render_template('admin/admin_manage_notifications.html')


