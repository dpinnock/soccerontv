"""
    sot.util.sotdate
    ----------------

    Date/Time handling

    Copyright: (c) 2011 by www.sotlive.com
"""

import datetime
from datetime import timedelta
import time
import pytz

class SotDateDays(object):
    
    def __init__(self):
        self.TODAY = datetime.datetime.today()
        self.MIDNIGHT_TODAY = datetime.datetime(self.TODAY.year, self.TODAY.month, self.TODAY.day, 0, 0, 0)
        self.MIDNIGHT_YESTERDAY = datetime.datetime(self.TODAY.year, self.TODAY.month, self.TODAY.day, 0, 0, 0) - timedelta(days = 1)
        self.TODAY_5AM = datetime.datetime(self.TODAY.year, self.TODAY.month, self.TODAY.day, 5, 0, 0)

class SotDate(object):
    
    # Constants
    SOT_DATESTRING = "%m %d %Y %I %M %p" # Month (number) Day (number) Year (whole year IE: 2011) Hour Minute AM / PM
    
    # Utility functions
    @staticmethod
    def buildDateString(data):
        return str(data["month"]) + " " + str(data["day"]) + " " + str(data["year"]) + " " + str(data["hour"]) + " " + str(data["minute"]) + " " + data["ampm"]
    
    @staticmethod
    def date2String(data):
        return data.strftime(SotDate.SOT_DATESTRING)
        
    @staticmethod
    def currentTime():
        d = SotDateDays()
        return d.TODAY
    
    @staticmethod
    def frontpageStartDate():
        """ If it's before 5 A.M. US/Eastern today return yesterday, otherwise return today """
        d = SotDateDays()
        return d.MIDNIGHT_TODAY if d.TODAY > d.TODAY_5AM else d.MIDNIGHT_YESTERDAY
    
    @staticmethod
    def getNextXDays(num):
        """ Return a list of the x days """
        return [SotDate.frontpageStartDate() + timedelta(days = x) for x in range(num)]
    
    @staticmethod
    def convertTimeZone(date, timeZone):
        """ Convert from ET timezone to some other timezone """
        newtz = None
        if timeZone == "CT":
            newtz = "US/Central"
        elif timeZone == "MT":
            newtz = "US/Mountain"
        elif timeZone == "PT":
            newtz = "US/Pacific"
        date = date.replace(tzinfo = pytz.timezone("US/Eastern"))
        return date.astimezone(pytz.timezone(newtz))