"""
    sot.blueprints.auth
    -------------------
    
    Auth Blueprint

    Copyright: (c) 2011 by www.sotlive.com
"""

import hashlib
from flask import abort, Blueprint, redirect, render_template, request, session, url_for
from mongokit import Document
from ..backendconfig.backendconfig import MongoConfig
from ..util.decorators import isLoggedIn

class J5Auth(object):

    j5Auth = Blueprint("j5Auth", __name__)
    
    @j5Auth.route("/login")
    @isLoggedIn("admin.serve", True)
    def serve():
        return render_template("login.html")
    
    @j5Auth.route("/login", methods = ["POST"])
    def authorize():
        if J5AuthUtil.authenticate(request.form):
            return redirect(url_for("admin.serve"))
        else:
            abort(401)
            
    @j5Auth.route("/logout")
    def logout():
        session.pop("logged_in", False)
        return redirect(url_for("admin.serve"))

class J5AuthUtil(object):

    @staticmethod
    def passwordHash(password):
        return unicode(hashlib.sha224(password).hexdigest())
        
    @staticmethod
    def authenticate(data):
        session["logged_in"] = True if UserAction.findUserPass(data) else False
        return session["logged_in"]

@MongoConfig.MONGODB_CONNECTION.register
class User(Document):

    __collection__ = "sot_users"
    __database__ = "sot"

    structure = {
        "username" : unicode,
        "password" : unicode,
    }

    indexes = [{
        "fields" : "username",
        "unique" : True
    }]

    use_dot_notation = True

class UserAction(object):

    @staticmethod
    def findUserPass(data):
        return MongoConfig.MONGODB_CONNECTION.User.one({ "username" : data["username"], "password" : J5AuthUtil.passwordHash(data["password"]) })

    # Need to turn this on once user setup exists
    """@staticmethod
    def insertUser(data):
        u = MongoConfig.MONGODB_CONNECTION.Users()
        u.username = data["username"]
        u.password = J5AuthUtil.passwordHash(data["password"])
        u.save()"""