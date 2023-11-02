from flask import Flask, request, jsonify, session
from functools import wraps
import json
import os
import random
import firebase_admin
from flask_cors import CORS
from datetime import datetime
from firebase_admin import credentials, initialize_app, db, firestore
import hashlib

app = Flask(__name__)
app.secret_key = "12345"
CORS(app)

cred = credentials.Certificate("./key.json")
initialize_app(cred)
db = firestore.client()

def logged_in(f):
    @wraps(f)
    def wrap(*args, **kwargs):
        if 'loggedIn' in session:
            return f(*args, **kwargs)
        else:
            return '<h1>Must be logged in to access this page</h1>'
    return wrap



@app.route('/login', methods = ['POST'])
def login():
    if request.method == 'POST':
        print('LOGIN POST')
        usersRef = db.collection('Users')
        data = request.json
        username = str(data['username'])
        password = str(data['password'])
        userID = hashlib.sha1(username.encode('utf-8')).hexdigest()
        userInfo = usersRef.document(userID).get().to_dict()

        if userInfo is None:
            return jsonify(alert="error")

        if username == userInfo['username'] and password == userInfo['password']:
            print('lollllll2')


            session['loggedIn'] = True
            session['username'] = username
            session['id'] = userID
            session['isAdmin'] = userInfo['isAdmin']
            return jsonify(alert="success")

        return jsonify(alert="error")

    return jsonify(alert="error")







@app.route('/register', methods = ['POST'])
def register():
    if request.method == 'POST':
        usersRef = db.collection('users')
        data = request.json
        username = str(data['username'])
        email = str(data['email'])
        password = str(data['password'])
        userType = str(data['userType'])
        userID = hashlib.sha1(username.encode('utf-8')).hexdigest()

        userInfo = usersRef.document(userID).get().to_dict()
        if userInfo is None:
            usersRef.document(userID).set({'username': username, 'email': email, 'password': password, 'userType': userType})
            session['loggedIn'] = True
            session['username'] = username
            session['id'] = userID
            session['userType'] = userType

        else:
            return jsonify(alert="username exists")

        return jsonify(alert="success")

    return jsonify(alert="error")


@app.route("/getusertype")
@logged_in
def getUserType():
    return jsonify(type = str(session['userType']))


@app.route("/getusername")
@logged_in
def getUsername():
    return jsonify(username = str(session['username']))

@app.route("/home")
def main():
    print('TEST WORKED')
    return jsonify(name="home")

@app.route("/logout", methods = ['GET'])
@logged_in
def logout():
    session.clear()
    return jsonify(alert="success")


if __name__ == "__main__":
    app.run(debug=True)