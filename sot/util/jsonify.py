"""
    sot.util.jsonify
    ----------------

    jsonify fix to handle datetime objects and bson objects from MongoDB
    See http://flask.pocoo.org/mailinglist/archive/2011/3/27/extending-jsonify/
    
    Copyright: (c) 2011 by www.sotlive.com
"""

import datetime
from flask import Response, request
from sotdate import SotDate

try:
    import json
except ImportError:
    import simplejson as json

try:
    from bson.objectid import ObjectId
except:
    pass

class APIEncoder(json.JSONEncoder):

    def default(self, obj):
        if isinstance(obj, (datetime.datetime, datetime.date)):
            return SotDate.date2String(obj)
        elif isinstance(obj, datetime.time):
            return obj.isoformat() # not used at this time but might be useful later
        elif isinstance(obj, ObjectId):
            return str(obj) # not used at this time but might be useful later
        return json.JSONEncoder.default(self, obj)

class JSON(object):

    @staticmethod
    def jsonify(data):
        return Response(json.dumps(data, cls = APIEncoder, indent = None if request.is_xhr else 2), mimetype = "application/json")