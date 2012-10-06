/**
*    sot.admin.js
*    JavaScript for the admin section
*    Copyright: (c) 2011 by www.sotlive.com
*/

// Namespace
var SOT = SOT || {};

SOT.ADMIN = (function () {
        // Clear all form field error messages
    var clearFieldLevelMessages = function (el) {
            el.hide();
        },
        // Enable some form field
        enableField = function (el) {
            el.removeAttr("disabled");
        },
        // Disable some form field
        disableField = function (el) {
            el.attr("disabled", "disabled");
        },
        // Turn form field data into JSON
        serializeSotForm = function (el) {
            return el.form2JSON();
        },
        // Show a message via a 'modal' window, uses bootstrap plugin
        message = function (elMt, elM, message) {
            elMt.text(message);
            elM.modal({ "show" : true, "backdrop" : true });
        },
        // Get the active listing type
        getActiveListingType = function () {
            return $("#activelistingtype").children("li.active").attr("id");
        };
    return {
        cflm : clearFieldLevelMessages,
        ef   : enableField,
        df   : disableField,
        ssf  : serializeSotForm,
        msg  : message,
        galt : getActiveListingType
    };
}());