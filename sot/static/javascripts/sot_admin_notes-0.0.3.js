/**
*    sot_admin_note.js
*    JavaScript for the note form
*    Copyright: (c) 2011 by www.sotlive.com
*/

$(document).ready(function () {
    $("#notedelete").click(SOT.NOTE.de);
    $("#noteclear").click(SOT.NOTE.ce);
    $("#notesubmit").click(SOT.NOTE.se);
    $("#noteclearid").click(SOT.NOTE.cnid);
    SOT.NOTE.gnlv();
});

// Namespace
var SOT = SOT || {};

SOT.NOTE = (function () {
        // Form validation rules
    var noteFormRules = {
            "noteid"  : {
                "required_verbs" : ["PUT", "DELETE"]
            },
            "notedate" : {
                "required_verbs" : ["PUT"]
            },
            "notesubject" : {
                "required" : true,
                "maxlength" : 25
            },
            "notebody" : {
                "required" : true,
                "maxlength" : 500
            }
        },
        // Map JSON to form fields
        noteJson2Form = function (data, action) {
            data.noteid = data._id;
            delete data._id;
            $.each(data, function (i, v) {
                $("#" + i).val(v);
            });
        },
        // Build note listing table notebody
        buildNoteListView = function (data) {
            var tableEl = $("#notelistview"),
                trEl = null;
            data = data.notelist;
            $.each(data, function (i, dataEl) {
                trEl = $("<tr>").attr("id", dataEl._id);
                trEl.append($("<td>").attr("id", "notedate").text(dataEl.notedate.substring(0, 10).replace(/ /gi, "/") + " " + dataEl.notedate.substring(11, 16).replace(/ /gi, ":") + " " + dataEl.notedate.substring(16, 19)));
                trEl.append($("<td>").attr("id", "notesubject").text(dataEl.notesubject));
                trEl.append($("<td>").attr("id", "notebody").html("<span class='label important note' title='Note' data-content='" + dataEl.notebody + "'>Note Body</span>"));
                trEl.append($("<td>").append($("<a>").attr("class", "editrecord").attr("href", "#").text("Edit Record")));
                tableEl.append(trEl);
            });
            // Events to attach after table data written out
            $(".editrecord").click(function (e) {
                var el = $(this);
                SOT.AJAX.sxhr("GET", "/note/" + el.parent("td").parent("tr").attr("id"), null, "Error Loading Note Record", null, noteJson2Form, null, null, null);
            });
            $(".note").popover({ offset: 10, placement : "left" }).click(function (e) {
                e.preventDefault();
            });
        },
        // Call the server to get note list view data
        getNoteListView = function () {
            $("#notelistview").children("tbody").children("tr").remove();
            SOT.AJAX.sxhr("GET", "/note/all", null, "Error Loading Note List View", null, buildNoteListView, null, null, null);
        },
        // Delete button click event
        deleteEvent = function (e) {
            if (confirm("Are you sure you want to delete this record?")) {
                SOT.AJAX.sxhr("DELETE", "/note/" + $("#noteid").val(), null, "Note Entry Delete Error", "Note Entry Delete Success", null, getNoteListView, $("#noteform"), null);
            }
            return false;
        },
        // Clear button click event
        clearEvent = function (e) {
            SOT.ADMIN.cflm($("p[id*='error']"));
            $("#noteform").resetForm();
            return false;
        },
        // Save button click event
        saveEvent = function (e) {
            SOT.ADMIN.ef($("#noteid"));
            SOT.ADMIN.ef($("#notedate"));
            var formValues = SOT.ADMIN.ssf($("#noteform"));
            SOT.ADMIN.cflm($("p[id*='error']"));
            SOT.ADMIN.df($("#noteid"));
            SOT.ADMIN.df($("#notedate"));
            var errors = $.validateSotForm(noteFormRules, formValues, "POST");
            if (errors.length > 0) {
                $.writeSotFormErrors(errors);
            }
            else {
                var verb = (formValues.noteid) ? "PUT" : "POST",
                    url = (verb === "PUT") ? "/note/" + formValues.noteid : "/note/",
                    sM = (verb === "PUT") ? "Note Entry Update Successful" : "Note Entry Insert Successful",
                    eM = (verb === "PUT") ? "Note Entry Update Error" : "Note Entry Insert Error",
                    rId = (verb === "PUT") ? null : $("#noteid");
                SOT.AJAX.sxhr(verb, url, JSON.stringify(formValues), eM, sM, noteJson2Form, getNoteListView, null, rId);
            }
            return false;
        },
        clearNoteId = function (e) {
            $("#noteid").val("");
            $("#notedate").val("");
            return false;
        };
    return {
        gnlv : getNoteListView,
        de   : deleteEvent,
        ce   : clearEvent,
        se   : saveEvent,
        cnid : clearNoteId
    };
}());