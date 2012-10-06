/**
*    sot_frontpage.js
*    JavaScript for the frontpage
*    Copyright: (c) 2011 by www.sotlive.com
*/

// Namespace
var SOT = SOT || {};

$(document).ready(function () {
    SOT.FRONTPAGE.init();
});

SOT.FRONTPAGE = (function () {
    var timeZoneMap = { "ET" : 0, "CT" : 1, "MT" : 2, "PT" : 3 },
        timeZoneActiveOld = { "active" : "ET", "old" : "ET" },
        filterType = "$in",
        markActiveTimeZone = function (pTimeZoneClass, pEl) {
            timeZoneActiveOld.old = timeZoneActiveOld.active;
            timeZoneActiveOld.active = $(pEl).children("span").text().substring(0, 2);
            if (timeZoneActiveOld.active == timeZoneActiveOld.old) {
                return false;
            }
            $(pTimeZoneClass + " span").removeClass("active-timezone");
            $(pTimeZoneClass).parent("li").parent("ul").children("li").children("a").children("span").each(function () {
                if ($(this).text().indexOf(" *") > -1) {
                    $(this).text($(this).text().substring(0, 2));
                    return false; // break each loop
                }
            });
            $(pEl).children("span").addClass("active-timezone");
            $(pEl).parent("li").parent("ul").parent("li").children("a").children("span").text(timeZoneActiveOld.active);
            $(pEl).children("span").text(timeZoneActiveOld.active + " *");
            return true;
        },
        buildGameListView = function (data) {
            data = data.gamelist;
            for (var i = 0; i < 5; i++) {
                var tableEl = $("#" + i),
                    trEl = null;
                $.each(data[i], function(i, dataEl) { 
                    trEl = $("<tr>");
                    trEl.append($("<td>").attr("class", "td-games time").text(dataEl.gametime.substring(11, 16).replace(/ /gi, ":") + " " + dataEl.gametime.substring(16, 19) + " " + dataEl.timezone));
                    trEl.append($("<td>").attr("class", "td-games").text(dataEl.station));
                    trEl.append($("<td>").attr("class", "td-games").text(dataEl.league));
                    trEl.append($("<td>").attr("class", "td-games").text(dataEl.hometeam + " vs. " + dataEl.awayteam));
                    // Handle match preview
                    if (dataEl.matchpreview) {
                        trEl.append($("<td>").attr("class", "td-games").html("<a href='" + dataEl.matchpreview + "' target='_blank'>Match Preview</a>"));
                    }
                    else {
                        trEl.append($("<td>").attr("class", "td-games").text(""));
                    }
                    tableEl.append(trEl);
                });
                // Handle the table hack
                trEl = $("<tr>").attr("style", "color: #FFF; cursor: default;");
                trEl.append($("<td>").attr("style", "border-left: none; border-bottom:none; background-color: #FFF; cursor: default;").text("Manchester U"));
                trEl.append($("<td>").attr("style", "border-left: none; border-bottom:none; background-color: #FFF; cursor: default;").text("Real Madrid PSG"));
                trEl.append($("<td>").attr("style", "border-left: none; border-bottom:none; background-color: #FFF; cursor: default;").text("Barcelona Chelsea FC"));
                trEl.append($("<td>").attr("style", "border-left: none; border-bottom:none; background-color: #FFF; cursor: default;").text("Champions League Premier League La Liga USMNT"));
                trEl.append($("<td>").attr("style", "border-left: none; border-bottom:none; background-color: #FFF; cursor: default;").text("AC Milan CSKA"));
                tableEl.append(trEl);
            }
        },
        removeTableData = function () {
            $(".zebra-striped").children("tbody").children("tr").remove();
        },
        getGameListView = function (pType) {
            removeTableData();
            SOT.AJAX.sxhr("GET", "/timezone/" + timeZoneActiveOld.active + "/" + pType, null, "Error Loading Game List View", null, buildGameListView, null, null, null);
        },
        getFilterCriteria = function () {
            var items = $(".ms-elem-selected"),
                jsonItems = {};
            items.each(function () {
                jsonItems[$(this).attr("ms-value")] = $(this).text();
            });
            return jsonItems;
        },
        filterData = function (data) {
            removeTableData();
            SOT.AJAX.sxhr("POST", "/filter/" + timeZoneActiveOld.active + "/" + SOT.ADMIN.galt(), JSON.stringify(data), "Error Applying Advanced Filter Criteria", null, buildGameListView, null, null, null);
        },
        init = function () {
            // Dropdown
            $("body").bind("click", function (e) {
                $(".dropdown-toggle, .menu").parent("li").removeClass("open");
            });
            $(".dropdown-toggle, .menu").click(function (e) {
                $(this).parent("li").toggleClass("open");
                return false;
            });
            $("#advancedfilter").bind("click", function (e) {
                e.stopPropagation();
            });
            // Time zone
            $("a.timezone").click(function (e) {
                if (markActiveTimeZone("a.timezone", this)) {
                    getGameListView(SOT.ADMIN.galt());
                }
            });
            // Advanced filter combo box events 
            $("#in").click(function (e) {
                $("#filterexplanation").text("You will show only the selected items");
                filterType = $(this).val();
            });
            $("#nin").click(function (e) {
                $("#filterexplanation").text("You will exclude the selected items");
                filterType = $(this).val();
            });
            // Advanced filter multi select
            $("#optgroup").multiSelect({
                selectableHeader: "<h5 class='ms-header'>Filterable Items</h5>",
                selectedHeader: "<h5 class='ms-header'>Selected Items</h5>",
                afterSelect: function (value, text) {
                    $("#advancedfilterlink").addClass("unapplied-filter-color unapplied-filter");
                    $("#unappliedfilterwarning").show();
                },
                afterDeselect: function (value, text) {
                    if ($("#advancedfilterlink").hasClass("unapplied-filter-color") && $(".ms-elem-selected").length == 0) {
                        $("#advancedfilterlink").removeClass("unapplied-filter-color unapplied-filter");
                        $("#unappliedfilterwarning").hide();
                    } else {
                        $("#advancedfilterlink").addClass("unapplied-filter-color unapplied-filter");
                        $("#unappliedfilterwarning").show();
                    }
                }
            });
            // Advanced filter tree
            $("#ms-optgroup .ms-selectable").find("li.ms-elem-selectable").hide();
            $(".ms-optgroup-label").click(function () {
                if ($(this).hasClass("collapse")) {
                    $(this).nextAll("li").hide();
                    $(this).removeClass("collapse");
                } else {
                    $(this).nextAll("li:not(.ms-selected)").show();
                    $(this).addClass("collapse");
                }
            });
            // Advanced filter reset button
            $("#resetfilter").click(function () {
                $("#optgroup").multiSelect("deselect_all");
                filterData({ "filtertype" : "$in" }, "");
                $("#advancedfilterlink").removeClass("filter-applied");
                $(".ms-optgroup-label").nextAll("li").hide();
                $(".ms-optgroup-label").removeClass("collapse");
                $("#advancedfilterlink").removeClass("unapplied-filter-color unapplied-filter");
                $("#unappliedfilterwarning").hide();
            });
            // Advanced filter apply button
            $("#applyfilter").click(function () {
                var data = getFilterCriteria(),
                    removeApply = false;
                if ($.isEmptyObject(data)) {
                    removeApply = true;
                }
                data.filtertype = filterType;
                filterData(data);
                if (removeApply) {
                    $("#advancedfilterlink").removeClass("filter-applied");
                } else {
                    $("#advancedfilterlink").addClass("filter-applied");
                }
                $("#advancedfilterlink").removeClass("unapplied-filter-color unapplied-filter");
                $("#unappliedfilterwarning").hide();
            });
        };
    return {
        init : init
    };
}());