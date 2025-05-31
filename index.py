from flask import Flask,render_template

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

 # Gọi template 'index.html'

@app.route('/dangnhap')
def dangnhap():
    return render_template('dangnhap.html')


if __name__ == '__main__':
    app.run(debug=True)