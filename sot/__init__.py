"""
    sot.__init__
    ------------
    
    Application initialization

    Copyright: (c) 2011 by www.sotlive.com
"""

from flask import Flask
from sot.blueprints.admin import Admin
from sot.blueprints.frontend import Frontend
from sot.blueprints.game import Game
from sot.blueprints.auth import J5Auth
from sot.blueprints.notes import Note

app = Flask(__name__)
app.config.from_object(__name__)
app.secret_key = "secret :)" # import os os.urandom(24)
app.register_blueprint(Game.game)
app.register_blueprint(Frontend.frontend)
app.register_blueprint(Admin.admin)
app.register_blueprint(J5Auth.j5Auth)
app.register_blueprint(Note.note)