"""
    sot.backendconfig.backendconfig
    -------------------------------
    
    Backend configuration

    Copyright: (c) 2011 by www.sotlive.com
"""

from mongokit import Connection

class MongoConfig(object):

    MONGODB_HOST = "localhost"
    MONGODB_PORT = 27017
    MONGODB_CONNECTION = Connection(MONGODB_HOST, MONGODB_PORT)