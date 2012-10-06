"""
    sot.util.decorators
    -------------------

    Decorators

    Copyright: (c) 2011 by www.sotlive.com
"""

from functools import update_wrapper
from flask import redirect, session, url_for

def isLoggedIn(urlFor, flag):
    def inner(f):
        def wrapped(*args, **kwargs):
            if (session.get("logged_in", False) and flag) or (not session.get("logged_in", False) and not flag):
                return redirect(url_for(urlFor))
            else:
                return f(*args, **kwargs)
        return update_wrapper(wrapped, f)
    return inner