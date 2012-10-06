/**
*    sot.ajax.js
*    JavaScript for calls to the server
*    Copyright: (c) 2011 by www.sotlive.com
*/

// Namespace
var SOT = SOT || {};

SOT.AJAX = (function () {
    var sotXhr = function (type, url, data, eText, sText, sCallback, cCallback, cResetEl, cResetById) {
            $.ajax({
                type : type,
                contentType : "application/json",
                dataType : "json",
                url : url,
                data : data,
                success : function (data) {
                    if (sText) {
                        SOT.ADMIN.msg($("#messagetext"), $("#message"), sText);
                    }
                    if (sCallback) {
                        sCallback(data);
                    }
                },
                error : function () {
                    SOT.ADMIN.msg($("#messagetext"), $("#message"), eText);
                },
                complete : function (jqxhr, status) {
                    if (status === "success") {
                        if (cCallback) {
                            cCallback(SOT.ADMIN.galt());
                        }
                        if (cResetEl) {
                            cResetEl.resetForm();
                        }
                        if (cResetById) {
                            cResetById.val("");
                        }
                    }
                }
            });
        };
    return {
        sxhr : sotXhr
    };
}());