/**
*    sot_admin_gameentry.js
*    JavaScript for the game form
*    Copyright: (c) 2011 by www.sotlive.com
*/

$(document).ready(function () {
    $("#gamedelete").click(SOT.GAME.de);
    $("#gameclear").click(SOT.GAME.ce);
    $("#gamereport").click(SOT.GAME.re);
    $("#gamesubmit").click(SOT.GAME.se);
    $("#cleargameid").click(SOT.GAME.cgid);
    $("#cablelink").click(SOT.GAME.ltpe);
    $("#streamlink").click(SOT.GAME.ltpe);
    $("#replaylink").click(SOT.GAME.ltpe);
    SOT.GAME.gglv("cable");
});

// Namespace
var SOT = SOT || {};

SOT.GAME = (function () {
        // Form validation rules
    var gameFormRules = {
            "gameid"  : {
                "required_verbs" : ["PUT", "DELETE"]
            },
            "station" : {
                "required" : true,
                "maxlength" : 15
            },
            "league" : {
                "required" : true,
                "maxlength" : 20
            },
            "hometeam" : {
                "required" : true,
                "maxlength" : 20
            },
            "awayteam" : {
                "required" : true,
                "maxlength" : 20
            }
        },
        // Map JSON to form fields
        gameJson2Form = function (data, action) {
            data.month = (data.gametime.substring(0, 2) < 10) ? data.gametime.substring(1, 2) : data.gametime.substring(0, 2);
            data.day = (data.gametime.substring(3, 5) < 10) ? data.gametime.substring(4, 5) : data.gametime.substring(3, 5);
            data.year = data.gametime.substring(6, 10);
            data.hour = (data.gametime.substring(11, 13) < 10) ? data.gametime.substring(12, 13) : data.gametime.substring(11, 13);
            data.minute = (data.gametime.substring(14, 16) < 10) ? data.gametime.substring(15, 16) : data.gametime.substring(14, 16);
            data.ampm = data.gametime.substring(17, 19);
            data.gamenote = (data.gamenote) ? data.gamenote : "";
            data.gameid = data._id;
            data.listingtype = data.listingtype;
            delete data.gametime;
            delete data._id;
            $.each(data, function (i, v) {
                $("#" + i).val(v);
            });
        },
        // Build game listing table body
        buildGameListView = function (data) {
            var tableEl = $("#gamelistview"),
                trEl = null;
            data = data.gamelist;
            $.each(data, function (i, dataEl) {
                trEl = $("<tr>").attr("id", dataEl._id);
                trEl.append($("<td>").attr("id", "gametime").text(dataEl.gametime.substring(0, 10).replace(/ /gi, "/") + " " + dataEl.gametime.substring(11, 16).replace(/ /gi, ":") + " " + dataEl.gametime.substring(16, 19)));
                trEl.append($("<td>").attr("id", "station").text(dataEl.station));
                trEl.append($("<td>").attr("id", "league").text(dataEl.league));
                trEl.append($("<td>").attr("id", "hometeam").text(dataEl.hometeam));
                trEl.append($("<td>").attr("id", "awayteam").text(dataEl.awayteam));
                trEl.append($("<td>").append($("<a>").attr("class", "editrecord").attr("href", "#").text("Edit Record")));
                // Handle game notes
                if (dataEl.gamenote) {
                    trEl.append($("<td>").attr("id", "gamenote").html("<span class='label important note' title='Game Note' data-content='" + dataEl.gamenote + "'>Note</span>"));
                }
                else {
                    trEl.append($("<td>").attr("id", "gamenote"));
                }
                // Handle frontpage flag
                if (dataEl.frontpageflag == "No") {
                    trEl.append($("<td>").attr("id", "frontpageflag").html("<span class='label warning note'>" + dataEl.frontpageflag + "</span>"));
                }
                else {
                    trEl.append($("<td>").attr("id", "frontpageflag"));
                }
                tableEl.append(trEl);
            });
            // Events to attach after table data written out
            $(".editrecord").click(function (e) {
                var el = $(this);
                SOT.AJAX.sxhr("GET", "/game/" + el.parent("td").parent("tr").attr("id"), null, "Error Loading Game Record", null, gameJson2Form, null, null, null);
            });
            $(".note").popover({ offset: 10, placement : "left" }).click(function (e) {
                e.preventDefault();
            });
        },
        // Call the server to get game list view data
        getGameListView = function (pType) {
            $("#gamelistview").children("tbody").children("tr").remove();
            SOT.AJAX.sxhr("GET", "/game/all/" + pType, null, "Error Loading Game List View", null, buildGameListView, null, null, null);
        },
        // Delete button click event
        deleteEvent = function (e) {
            if (confirm("Are you sure you want to delete this record?")) {
                SOT.AJAX.sxhr("DELETE", "/game/" + $("#gameid").val(), null, "Game Entry Delete Error", "Game Entry Delete Success", null, getGameListView, $("#gameform"), null);
            }
            return false;
        },
        // Clear button click event
        clearEvent = function (e) {
            SOT.ADMIN.cflm($("p[id*='error']"));
            $("#gameform").resetForm();
            return false;
        },
        // Save button click event
        saveEvent = function (e) {
            SOT.ADMIN.ef($("#gameid"));
            var formValues = SOT.ADMIN.ssf($("#gameform"));
            SOT.ADMIN.cflm($("p[id*='error']"));
            SOT.ADMIN.df($("#gameid"));
            var errors = $.validateSotForm(gameFormRules, formValues, "POST");
            if (errors.length > 0) {
                $.writeSotFormErrors(errors);
            }
            else {
                var verb = (formValues.gameid) ? "PUT" : "POST",
                    url = (verb === "PUT") ? "/game/" + formValues.gameid : "/game/",
                    sM = (verb === "PUT") ? "Game Entry Update Successful" : "Game Entry Insert Successful",
                    eM = (verb === "PUT") ? "Game Entry Update Error" : "Game Entry Insert Error",
                    rId = (verb === "PUT") ? null : $("#gameid");
                SOT.AJAX.sxhr(verb, url, JSON.stringify(formValues), eM, sM, gameJson2Form, getGameListView, null, rId);
            }
            return false;
        },
        reportEvent = function (e) {
            SOT.AJAX.sxhr("GET", "/game/report", null, "Error generating listing report", null, showReportPopup, null, null, null);
            return false;
        },
        showReportPopup = function (data) {
            var popup = $("#reportpopup"),
                cableEl = $("#cablereporttext"),
                streamEl = $("#streamreporttext"),
                replayEl = $("#replayeporttext");
                
                cableEl.text("Live TV: Today we have " + data.cable.gamecount + " live games listed from " + data.cable.leaguecount + " leagues / competitions.");
                streamEl.text("Live Stream: Today we have " + data.stream.gamecount + " live games listed from " + data.stream.leaguecount + " leagues / competitions.");
                //replayEl.text("Replay: Today we have " + data.replay.gamecount + " replay games listed from " + data.replay.leaguecount + " leagues / competitions.");
                popup.modal({ "show" : true, "backdrop" : true });
            //SOT.ADMIN.msg($("#reporttext"), $("#reportpopup"), "Today we have " + data.gamecount + " live games listed from " + data.leaguecount + " leagues / competitions.");
        },
        clearGameId = function (e) {
            $("#gameid").val("");
            return false;
        },
        listingTypePillEvent = function (e) {
            var parentLi = $(this).parent("li");
            parentLi.parent("ul").children("li").removeClass("active"); // remove active pill
            parentLi.addClass("active"); // make the clicked pill active
            getGameListView(parentLi.attr("id"));
            return false;
        };
    return {
        gglv : getGameListView,
        de   : deleteEvent,
        ce   : clearEvent,
        se   : saveEvent,
        re   : reportEvent,
        cgid : clearGameId,
        ltpe : listingTypePillEvent
    };
}());