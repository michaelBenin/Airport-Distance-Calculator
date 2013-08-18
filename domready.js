(function (global, oDOC, handler) {
    var head = oDOC.head || oDOC.getElementsByTagName("head");

    function LABjsLoaded() {
        $LAB
            .setOptions({AlwaysPreserveOrder:true})
            .script("http://ajax.googleapis.com/ajax/libs/jquery/1.10.1/jquery.min.js")
            .script("http://cdnjs.cloudflare.com/ajax/libs/jquery-migrate/1.2.1/jquery-migrate.min.js")
            .script("https://raw.github.com/devbridge/jQuery-Autocomplete/master/dist/jquery.autocomplete.min.js")
            .script("http://maps.google.com/maps/api/js?v=3.exp&sensor=false&async=2")
            .script("http://maps.gstatic.com/intl/en_us/mapfiles/api-3/14/0/main.js")
            //.script("http://www.movable-type.co.uk/scripts/geo.js")
            //.script("http://www.movable-type.co.uk/scripts/latlon.js")
            .script("script.js");
    }


    // loading code borrowed directly from LABjs itself
    setTimeout(function () {
        if ("item" in head) { // check if ref is still a live node list
            if (!head[0]) { // append_to node not yet ready
                setTimeout(arguments.callee, 25);
                return;
            }
            head = head[0]; // reassign from live node list ref to pure node ref -- avoids nasty IE bug where changes to DOM invalidate live node lists
        }
        var scriptElem = oDOC.createElement("script"),
            scriptdone = false;
        scriptElem.onload = scriptElem.onreadystatechange = function () {
            if ((scriptElem.readyState && scriptElem.readyState !== "complete" && scriptElem.readyState !== "loaded") || scriptdone) {
                return false;
            }
            scriptElem.onload = scriptElem.onreadystatechange = null;
            scriptdone = true;
            LABjsLoaded();
        };
        scriptElem.src = "http://cdnjs.cloudflare.com/ajax/libs/labjs/2.0.3/LAB.min.js";
        head.insertBefore(scriptElem, head.firstChild);
    }, 0);

    // required: shim for FF <= 3.5 not having document.readyState
    if (oDOC.readyState == null && oDOC.addEventListener) {
        oDOC.readyState = "loading";
        oDOC.addEventListener("DOMContentLoaded", handler = function () {
            oDOC.removeEventListener("DOMContentLoaded", handler, false);
            oDOC.readyState = "complete";
        }, false);
    }
})(window, document);