from flask import Blueprint, render_template, redirect, url_for, session, flash, request

faculty = Blueprint('faculty', __name__, url_prefix='/sggd/gv/manage')


@faculty.route('/')
def faculty_login():
   
    return render_template('faculty/login_faculty.html')

@faculty.route('/home_faculty/')
def faculty_home():
   
    return render_template('faculty/home_faculty.html')

@faculty.route('/notifications/')
def faculty_notifications():
   
    return render_template('faculty/notifications_faculty.html')



@faculty.route('/profile_faculty/')
def faculty_profile():
   
    return render_template('faculty/profile.html')


@faculty.route('/stats_registration_faculty/')
def faculty_stats():
   
    return render_template('faculty/stats_faculty.html')


@faculty.route('/registration_faculty/')
def registration_faculty():
   
    return render_template('faculty/faculty_registration.html')
