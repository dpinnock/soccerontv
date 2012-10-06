/**
*    sot.jquery_plugins.js
*    JQuery plugins
*    Copyright: (c) 2011 by www.sotlive.com
*/

//==========================================================
// Validate form
// -------------
// usage $.validateSotForm(ruleSet, json, verb)
// @param: ruleSet - JSON of rules for some form, IE: { "form-field" : { "required" : true, "maxlength" : 15 }, ... }
// @param: json - All form field data from some form in JSON form, obtained via $("#myform").form2JSON()
// @param: verb - http verb to be used for the request (POST, PUT, GET, DELETE)
//==========================================================
(function ($) {
    $.validateSotForm = function (ruleSet, json, verb) {
        var errors = [],
            reqRm = "Field is required.",
            reqVm = "Field is required for this particular action.",
            reqMlm = function (mL) {
                return "Field length must be less than or equal to " + mL + ".";
            };
        $.each(ruleSet, function (el, elRules) {
            $.each(elRules, function (rule, req) {
                switch (rule) {
                    case "required":
                        if (json[el] === "") {
                            errors.push({ field : el, message : reqRm });
                        }
                        break;
                    case "required_verbs":
                        $.each(req, function (i, aA) {
                            if (verb === aA) {
                                errors.push({ field : el, message : reqVm });
                                return false;
                            }
                        });
                        break;
                    case "maxlength":
                        if (json[el].length > req) {
                            errors.push({ field : el, message : reqMlm(req) });
                        }
                        break;
                    default:
                        break;
                }
            });
        });
        return errors;
    };
}(jQuery));

//==========================================================
// Write out form errors
// ---------------------
// usage $.writeSotFormErrors(errors)
// @param: errors - Array of JavaScript objects containing 'field' and 'message' keys
//==========================================================
(function ($) {
    $.writeSotFormErrors = function (errors) {
        $.each(errors, function(i, error) {
            $("#" + error.field + "_error").css("display", "block");
            $("#" + error.field + "_error").text(error.message);
        });
    };
}(jQuery));

//==========================================================
// Reset a form to default state
// -----------------------------
// usage $("#myform").resetForm();
//==========================================================
(function ($) {
    $.fn.resetForm = function () {
        $(this)[0].reset();
    };
}(jQuery));

//==========================================================
// Serialize form to JSON
// ----------------------
// usage $("#myform").form2JSON();
//
// One caveat, disabled elements aren't serialized properly, must temporarily enable them before calling this function.
// Checkboxes aren't serialized properly, change function if needed
//==========================================================
(function ($) {
    $.fn.form2JSON = function () {
        var json = {};
        $.map($(this).serializeArray(), function (el) {
            json[el.name] = el.value.trim();
        });
        return json;
    };
}(jQuery));