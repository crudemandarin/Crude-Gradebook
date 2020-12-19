import json
import datetime
import os

from functools import wraps
from flask import Blueprint, request, abort, jsonify
import bcrypt
import jwt

from .extensions import mongo

main = Blueprint('main', __name__)

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        if 'x-access-token' in request.headers:
            token = request.headers['x-access-token']
        else: return jsonify({'message': 'Token is missing!'}), 401

        try:
            data = jwt.decode(token, os.environ.get('SECRET_KEY'))
            current_user = mongo.db.users.find_one_or_404({'username': data['username']})
        except: return jsonify({'message': 'Token invalid!'}), 401

        return f(current_user, *args, **kwargs)
    return decorated

@main.route('/')
def index():
    return '<h1>Hey there, friend!</h1><p>There\'s nothing to see here.</p>'

@main.route('/api')
def testDBConnection():
    test = mongo.db.users.find_one_or_404({"username": "test"})
    return test['firstname']

@main.route('/api/login', methods=['POST'])
def login():
    if not request.json or not 'username' in request.json or not 'password' in request.json: abort(400)

    user = mongo.db.users.find_one_or_404({'username': request.json['username']})

    password_hash = user['password_hash']
    input_password = request.json['password']

    if bcrypt.checkpw( input_password.encode('utf-8'), password_hash.encode('utf-8') ):
        token = jwt.encode( {'username': user['username'], 'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=30)}, os.environ.get('SECRET_KEY') )
        return jsonify( {'token': token.decode()} )
    
    # If password is invalid, abort
    abort(400)

@main.route('/api/users', methods=['POST'])
def createUser():
    # Validates request
    if not request.json or not 'username' in request.json or not 'firstname' in request.json or not 'password' in request.json: abort(400)

    # Validates user does not already exist. If user exists, abort
    user = mongo.db.users.find_one({'username': request.json['username']})
    if user is not None: abort(400)

    password_hash = bcrypt.hashpw( (request.json['password']).encode('utf-8'), bcrypt.gensalt() )

    newUser = {
        'username': request.json['username'],
        'firstname': request.json['firstname'],
        'password_hash': password_hash.decode()
    }
    newUserTranscript = {
        'username': request.json['username'],
        'transcript': [None]
    }

    mongo.db.users.insert_one( newUser )
    mongo.db.transcripts.insert_one( newUserTranscript )

    return jsonify( {'message': 'The account was successfully created'} )

@main.route('/api/users', methods=['GET'])
@token_required
def getCurrentUser(current_user):
    output = {
        'username': current_user['username'],
        'firstname': current_user['firstname']
    }
    return jsonify(output)
    
@main.route('/api/users/transcript', methods=['GET'])
@token_required
def getCurrentUserTranscript(current_user):
    transcript = mongo.db.transcripts.find_one_or_404( {'username': current_user['username']} )
    return jsonify(transcript['transcript'])

@main.route('/api/users/transcript', methods=['PUT'])
@token_required
def updateCurrentUserTranscript(current_user):
    if not request.json or not 'transcript' in request.json: abort(400)
    mongo.db.transcripts.update_one( {'username': current_user['username']} , { '$set': {'transcript': request.json['transcript']} } )
    return jsonify({'message': 'The user transcript has been successfully updated.'})