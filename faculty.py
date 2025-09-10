from flask import Blueprint, render_template, redirect, url_for, session, flash, request

faculty = Blueprint('faculty', __name__, url_prefix='/gv')



@faculty.route('/home_faculty/')
def faculty_home():
   
    return render_template('faculty/home_faculty.html')

@faculty.route('/notifications/')
def faculty_notifications():
   
    return render_template('faculty/notifications_faculty.html')



@faculty.route('/profile_faculty/')
def faculty_profile():
   
    return render_template('faculty/profile.html')


@faculty.route('/registrations/')
def registration_faculty():
   
    return render_template('faculty/registrations_faculty.html')

@faculty.route('/edit_score/')
def edit_score():
   
    return render_template('faculty/edit_score.html')


@faculty.route('/thoikhoabieu/')
def tkb():
   
    return render_template('faculty/tkb_gv.html')



@faculty.route('/diemso/')
def diemso():
    
    return render_template('faculty/add_score.html')

@faculty.route('/dangkynhaphoc/')
def dangkynhaphoc():
    
    return render_template('faculty/dangkynhaphoc.html')


@faculty.route('/tintuc/')
def tintuc():
    
    return render_template('faculty/manage_news.html')

@faculty.route('/CNNVQS/')
def CNNVQS():
    
    return render_template('faculty/CNNVQS.html')

@faculty.route('/CNSV/')
def CNSV():
    
    return render_template('faculty/CNSV.html')

@faculty.route('/VayVon/')
def VayVon():
    
    return render_template('faculty/VayVon.html')
