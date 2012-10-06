"""
    sot.blueprints.game
    -------------------
    
    Game Blueprint

    Copyright: (c) 2011 by www.sotlive.com
"""

import datetime
from datetime import timedelta
import shortuuid
from flask import abort, Blueprint, jsonify, request
from mongokit import Document
from ..backendconfig.backendconfig import MongoConfig
from ..util.decorators import isLoggedIn
from ..util.sotdate import SotDate
from ..util.jsonify import JSON

class Game(object):

    game = Blueprint("game", __name__, url_prefix = "/game")
    
    @game.route("/", methods = ["POST"])
    @isLoggedIn("j5Auth.serve", False)
    def insertGame():
        return JSON.jsonify(GameAction.insertGame(request.json))
    
    @game.route("/<id>", methods = ["PUT"])
    @isLoggedIn("j5Auth.serve", False)
    def updateGame(id):
        return JSON.jsonify(GameAction.updateGame(request.json))
    
    @game.route("/<id>", methods = ["DELETE"])
    @isLoggedIn("j5Auth.serve", False)
    def deleteGame(id):
        data = GameAction.fetchGameById(id)
        if data:
            GameAction.deleteGame(data["_id"])
            return JSON.jsonify(dict({ "success" : 200 })) # just return some JSON, doesn't matter what
        else:
            abort(404)
        
    @game.route("/<id>")
    @isLoggedIn("j5Auth.serve", False)
    def getGame(id):
        data = GameAction.fetchGameById(id)
        if data:
            return JSON.jsonify(data)
        else:
            abort(404)
        
    @game.route("/all/<listingtype>")
    @isLoggedIn("j5Auth.serve", False)
    def getAllGames(listingtype):
        return JSON.jsonify(dict({ "gamelist" : GameAction.fetchAllGames(listingtype) }))
        
    @game.route("/frontpage")
    @isLoggedIn("j5Auth.serve", False)
    def getFrontpageGames():
        return JSON.jsonify(dict({ "gamelist" : GameAction.fetchGamesXDays(5, "cable") }))
    
    @game.route("/report")
    @isLoggedIn("j5Auth.serve", False)        
    def getTodayListingReport():
        # get all three types
        report = dict({})
        data = GameAction.fetchGamesXDays(1, "cable")
        report["cable"] = dict({ "gamecount" : len(data), "leaguecount" : len(list(set([x["league"] for x in data]))) })
        data = GameAction.fetchGamesXDays(1, "stream")
        report["stream"] = dict({ "gamecount" : len(data), "leaguecount" : len(list(set([x["league"] for x in data]))) })
        data = GameAction.fetchGamesXDays(1, "replay")
        report["replay"] = dict({ "gamecount" : len(data), "leaguecount" : len(list(set([x["league"] for x in data]))) })
        return JSON.jsonify(report)
        
@MongoConfig.MONGODB_CONNECTION.register
class SotGame(Document):

    __collection__ = "sot_games"
    __database__ = "sot"

    structure = {
        "_id"           : unicode,
        "gametime"      : datetime.datetime,
        "station"       : unicode,
        "league"        : unicode,
        "hometeam"      : unicode,
        "awayteam"      : unicode,
        "gamenote"      : unicode,
        "frontpageflag" : unicode,
        "matchpreview"  : unicode,
        "listingtype"   : unicode
    }
    
    indexes = [{
        "fields" : "gametime"
    }]

    use_dot_notation = True

class GameAction(object):

    @staticmethod
    def insertGame(data):
        g = MongoConfig.MONGODB_CONNECTION.SotGame()
        g._id = shortuuid.uuid().decode("utf-8")
        g.gametime = datetime.datetime.strptime(SotDate.buildDateString(data), SotDate.SOT_DATESTRING)
        # The 'u"" + key' is a hack... fix this
        g.station = u"" + data["station"]
        g.league = u"" + data["league"]
        g.hometeam = u"" + data["hometeam"]
        g.awayteam = u"" + data["awayteam"]
        g.gamenote = u"" + data["gamenote"]
        g.frontpageflag = u"" + data["frontpageflag"]
        g.matchpreview = u"" + data["matchpreview"]
        g.listingtype = u"" + data["listingtype"]
        g.save()
        return GameAction.fetchGameById(g._id)
        
    @staticmethod
    def updateGame(data):
        g = MongoConfig.MONGODB_CONNECTION.SotGame()
        # The 'u"" + key' is a hack... fix this
        g._id = u"" + data["gameid"]
        g.gametime = datetime.datetime.strptime(SotDate.buildDateString(data), SotDate.SOT_DATESTRING)
        g.station = u"" + data["station"]
        g.league = u"" + data["league"]
        g.hometeam = u"" + data["hometeam"]
        g.awayteam = u"" + data["awayteam"]
        g.gamenote = u"" + data["gamenote"]
        g.frontpageflag = u"" + data["frontpageflag"]
        g.matchpreview = u"" + data["matchpreview"]
        g.listingtype = u"" + data["listingtype"]
        g.save()
        return GameAction.fetchGameById(g._id)

    @staticmethod
    def deleteGame(id):
        g = MongoConfig.MONGODB_CONNECTION.SotGame()
        g._id = id
        g.delete()

    @staticmethod
    def fetchGameById(id):
        return MongoConfig.MONGODB_CONNECTION.SotGame.one({ "_id" : id }) 
        
    @staticmethod 
    def fetchGamesXDays(num, listingType):
        return [x for x in MongoConfig.MONGODB_CONNECTION.SotGame.find({ "gametime" : { "$gte" : SotDate.frontpageStartDate(), "$lt" : SotDate.frontpageStartDate() + timedelta(days = num) }, "frontpageflag" : "Yes", "listingtype" : listingType })]

    @staticmethod
    def fetchAllGames(listingType):
        return [x for x in MongoConfig.MONGODB_CONNECTION.SotGame.find({ "gametime" : { "$gte" : SotDate.frontpageStartDate() }, "listingtype" : listingType}).sort("gametime")]
    
    @staticmethod
    def fetchFilterGamesXDays(num, listingType, filterData):
        query = {}
        queryType = request.json["filtertype"] # get it from filterData $nin
        queryData = GameUtil.buildFilterData(filterData)
        if queryType == "$in":
            queryParams = GameUtil.buildInQueryParams(queryData, queryType)
            if queryParams:
                query["$or"] = queryParams
        # $nin hack...
        else:
            if len(queryData[0]) > 0:
                query["station"] = { queryType : queryData[0] }
            if len(queryData[1]) > 0:
                query["league"] = { queryType : queryData[1] }
            if len(queryData[2]) > 0:
                query["hometeam"] = { queryType : queryData[2] }
                query["awayteam"] = { queryType : queryData[2] }
        query["frontpageflag"] = "Yes"
        query["gametime"] = { "$gte" : SotDate.frontpageStartDate(), "$lt" : SotDate.frontpageStartDate() + timedelta(days = num) }
        query["listingtype"] = listingType
        return [x for x in MongoConfig.MONGODB_CONNECTION.SotGame.find(query)]
        
class GameUtil(object):
    
    @staticmethod
    def buildFilterData(filterData):
        data = [[], [], []] # station, league, team
        for k, v in filterData.iteritems():
            if k.startswith("station-"):
                data[0].append(v)
            elif k.startswith("league-"):
                data[1].append(v)
            elif k.startswith("team-"):
                data[2].append(v)
        return data
        
    @staticmethod
    def buildInQueryParams(queryData, queryType):
        data = []
        if len(queryData[0]) > 0:
            data.append({ "station" : { queryType : queryData[0] }})
        if len(queryData[1]) > 0:
            data.append({ "league" : { queryType : queryData[1] }})
        if len(queryData[2]) > 0 and queryType == "$in":
            data.append({ "hometeam" : { queryType : queryData[2] }})
            data.append({ "awayteam" : { queryType : queryData[2] }})
        return data
        