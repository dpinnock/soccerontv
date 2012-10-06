"""
    sot.blueprints.notes
    --------------------

    Note Blueprint

    Copyright: (c) 2011 by www.sotlive.com
"""

import datetime
import shortuuid
from flask import abort, Blueprint, jsonify, request
from mongokit import Document
from ..backendconfig.backendconfig import MongoConfig
from ..util.decorators import isLoggedIn
from ..util.sotdate import SotDate
from ..util.jsonify import JSON

class Note(object):

    note = Blueprint("note", __name__, url_prefix = "/note")

    @note.route("/", methods = ["POST"])
    @isLoggedIn("j5Auth.serve", False)
    def insertNote():
        return JSON.jsonify(NoteAction.insertNote(request.json))

    @note.route("/<id>", methods = ["PUT"])
    @isLoggedIn("j5Auth.serve", False)
    def updateNote(id):
        return JSON.jsonify(NoteAction.updateNote(request.json))

    @note.route("/<id>", methods = ["DELETE"])
    @isLoggedIn("j5Auth.serve", False)
    def deleteNote(id):
        data = NoteAction.fetchNoteById(id)
        if data:
            NoteAction.deleteNote(data["_id"])
            return JSON.jsonify(dict({ "success" : 200 })) # just return some JSON, doesn't matter what
        else:
            abort(404)

    @note.route("/<id>")
    @isLoggedIn("j5Auth.serve", False)
    def getNote(id):
        data = NoteAction.fetchNoteById(id)
        if data:
            return JSON.jsonify(data)
        else:
            abort(404)

    @note.route("/all")
    @isLoggedIn("j5Auth.serve", False)
    def getAllNotes():
        return JSON.jsonify(dict({ "notelist" : NoteAction.fetchAllNotes() }))

@MongoConfig.MONGODB_CONNECTION.register
class SotNote(Document):

    __collection__ = "sot_notes"
    __database__ = "sot"

    structure = {
        "_id"           : unicode,
        "notedate"      : datetime.datetime,
        "notesubject"   : unicode,
        "notebody"      : unicode
    }

    indexes = [{
        "fields" : "notedate"
    }]

    use_dot_notation = True

class NoteAction(object):

    @staticmethod
    def insertNote(data):
        n = MongoConfig.MONGODB_CONNECTION.SotNote()
        n._id = shortuuid.uuid().decode("utf-8")
        n.notedate = datetime.datetime.now()
        # The 'u"" + key' is a hack... fix this
        n.notesubject = u"" + data["notesubject"]
        n.notebody = u"" + data["notebody"]
        n.save()
        return NoteAction.fetchNoteById(n._id)

    @staticmethod
    def updateNote(data):
        n = MongoConfig.MONGODB_CONNECTION.SotNote()
        # The 'u"" + key' is a hack... fix this
        n._id = u"" + data["noteid"]
        n.notedate = datetime.datetime.strptime(data["notedate"], SotDate.SOT_DATESTRING)
        n.notesubject = u"" + data["notesubject"]
        n.notebody = u"" + data["notebody"]
        n.save()
        return NoteAction.fetchNoteById(n._id)

    @staticmethod
    def deleteNote(id):
        n = MongoConfig.MONGODB_CONNECTION.SotNote()
        n._id = id
        n.delete()

    @staticmethod
    def fetchNoteById(id):
        return MongoConfig.MONGODB_CONNECTION.SotNote.one({ "_id" : id })

    @staticmethod
    def fetchAllNotes():
        return [x for x in MongoConfig.MONGODB_CONNECTION.SotNote.find().sort("notedate", -1)]