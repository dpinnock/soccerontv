"""
    sot.blueprints.frontend
    -----------------------
    
    Frontend Blueprint

    Copyright: (c) 2011 by www.sotlive.com
"""

import operator
from flask import abort, Blueprint, render_template, Response, request, session
from jinja2 import TemplateNotFound
from game import GameAction
from ..util.sotdate import SotDate
from ..util.jsonify import JSON

class Frontend(object):

    frontend = Blueprint("frontend", __name__)
    
    @frontend.route("/")
    def frontpage():            
        fpDateRange = SotDate.getNextXDays(5)
        data = GameAction.fetchGamesXDays(5, "cable")
        filterLists = FrontendUtil.buildFilterLists(data)
        gameData = FrontendUtil.getGamesPerDay(data, fpDateRange)
        return render_template("frontpage.html", fpDateRange = fpDateRange, gameData = gameData, stationList = filterLists[0], leagueList = filterLists[1], teamList = filterLists[2], activeListingType = "cable")
    
    @frontend.route("/type/<listingType>", methods = ["GET"])
    def listing(listingType):
        if FrontendUtil.isValidListingType(listingType):
            fpDateRange = SotDate.getNextXDays(5)
            data = GameAction.fetchGamesXDays(5, listingType)
            filterLists = FrontendUtil.buildFilterLists(data)
            gameData = FrontendUtil.getGamesPerDay(data, fpDateRange)
            return render_template("frontpage.html", fpDateRange = fpDateRange, gameData = gameData, stationList = filterLists[0], leagueList = filterLists[1], teamList = filterLists[2], activeListingType = listingType)
        else:
            abort(404)
        
    @frontend.route("/timezone/<timeZone>/<listingType>", methods = ["GET"])
    def timezone(timeZone, listingType):
        if FrontendUtil.isValidTimeZone(timeZone) and FrontendUtil.isValidListingType(listingType):
            data = GameAction.fetchGamesXDays(5, listingType)
            gameData = FrontendUtil.getGamesPerDay(data, SotDate.getNextXDays(5), timeZone)
            return JSON.jsonify(dict({ "gamelist" : gameData }))
        else:
            abort(404)

    @frontend.route("/filter/<timeZone>/<listingType>", methods = ["POST"])
    def filter(timeZone, listingType):
        if FrontendUtil.isValidTimeZone(timeZone) and FrontendUtil.isValidListingType(listingType):
            data = GameAction.fetchFilterGamesXDays(5, listingType, request.json)
            gameData = FrontendUtil.getGamesPerDay(data, SotDate.getNextXDays(5), timeZone)
            return JSON.jsonify(dict({ "gamelist" : gameData }))
        
    @frontend.route("/Sitemap")
    def sitemap():
        return Response(response=render_template("Sitemap.xml"), mimetype="application/xml", content_type="application/xml")
    
    @frontend.route("/<page>")
    def serve(page):
        try:
            return render_template(page + ".html")
        except TemplateNotFound:
            abort(404)
            
class FrontendUtil(object):

    @staticmethod
    def getGamesPerDay(gameData, dateRange, timeZone = "ET"):
        gameData.sort(key = operator.itemgetter("gametime", "station", "league", "hometeam", "awayteam"))
        gameData = FrontendUtil.groupGamesPerDay(dateRange, gameData, timeZone)
        return gameData
    
    # This can be improved, revisit later...
    @staticmethod
    def groupGamesPerDay(dateRange, data, timeZone):
        gameList = []
        for y in data:
            if timeZone != "ET":
                y["gametime"] = SotDate.convertTimeZone(y["gametime"], timeZone)
            y["timezone"] = timeZone
        for x in dateRange:
            gamesForDay = []
            for y in data:
                if x.day == y["gametime"].day:
                    gamesForDay.append(y)
            gameList.append(gamesForDay)
        return gameList
        
    @staticmethod
    def buildFilterLists(data):
        stationList = []
        leagueList = []
        teamList = []
        for x in data:
            if x["station"] not in stationList:
                stationList.append(x["station"])
            if x["league"] not in leagueList:
                leagueList.append(x["league"])
            if x["hometeam"] not in teamList:
                teamList.append(x["hometeam"])
            if x["awayteam"] not in teamList:
                teamList.append(x["awayteam"])
        stationList.sort()
        leagueList.sort()
        teamList.sort()
        return [stationList, leagueList, teamList]
    
    @staticmethod
    def isValidTimeZone(timeZone):
        return timeZone == "ET" or timeZone == "CT" or timeZone == "MT" or timeZone == "PT"
        
    @staticmethod
    def isValidListingType(listingType):
        return listingType == "cable" or listingType == "stream"
