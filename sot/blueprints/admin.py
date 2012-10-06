"""
    sot.blueprints.admin
    --------------------
    
    Admin Blueprint

    Copyright: (c) 2011 by www.sotlive.com
"""

from flask import abort, Blueprint, render_template, session
from jinja2 import TemplateNotFound
from ..util.decorators import isLoggedIn

class Admin(object):

    admin = Blueprint("admin", __name__, url_prefix = "/admin")
    entryType = dict({ "sot_admin_gameentry" : "Game", "sot_admin_notes" : "Notes" })
    
    @admin.route("/", defaults = { "page" : "sot_admin_gameentry" })
    @admin.route("/<page>")
    @isLoggedIn("j5Auth.serve", False)
    def serve(page):
        try:
            return render_template(page + ".html", entryType = Admin.entryType.get(page, "Admin"))
        except TemplateNotFound:
            abort(404)