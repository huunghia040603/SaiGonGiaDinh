from flask import Flask,render_template

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

 # Gọi template 'index.html'

@app.route('/dangnhap')
def dangnhap():
    return render_template('dangnhap.html')


@app.route('/private_policy')
def private_policy():
    return render_template('private_policy.html')

@app.route('/profile')
def profile():
    return render_template('profile.html')


if __name__ == '__main__':
    app.run(debug=True)