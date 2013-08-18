(function(){

    var App = (function(){

        var _config;

        return {
            load: function(){
                _config = $.parseJSON($('#config').html());
                App.map.init();
                return this;
            },
            read: function(){
                return _config;
            }
        };

    }());

    App.events = (function(){

        var $form = $('form'),
            $clear = $('#clear');


        return {

            on: function(){

                    $clear.on('click', function(){
                       App.view.clear();
                    });

                    $form.on('submit', function(e) {
                        e.preventDefault();

                        var $inputs = $('input'),
                            input_total_values = '',
                            error_message = '',
                            coordinates = [],

                            validated = function(){

                                var scope = this;

                                scope.isValid = true;

                                $.each($inputs, function(index, el){

                                    if(el.value.length === 0){
                                        $(el).addClass('error');
                                        scope.isValid = false;
                                    }else{
                                        if(!el.getAttribute('data-lng')){
                                            scope.isValid = false;
                                            $(el).addClass('error');
                                        }
                                    }

                                    input_total_values += el.value;
                                });

                                if(input_total_values.length ===0){
                                    scope.isValid = false;
                                }

                                return this.isValid;
                            };

                        if(validated()){

                            var distance = 0;

                            App.map.clear_markers();

                            $.each($inputs, function(i, el){

                                var $end = $(el),
                                    $start = $($inputs[i-1]);

                                App.map.mark($end.attr('data-lat'), $end.attr('data-lng'), $end.attr('data-airport'));

                                if(i > 0) {
                                    distance = distance + App.calculate.distance(
                                        $start.attr('data-lat'), $start.attr('data-lng'),
                                        $end.attr('data-lat'), $end.attr('data-lng')
                                    );
                                }
                            });

                            App.map.center();

                            $('#distance').html(distance +' miles');

                        }else{
                            alert('Please type in two airports');
                        }

                    });

                return App;
            },

            off: function(){
                $form.off();
                $clear.off();
            }

        };

    }());

    App.view = (function(){

        var $input = $('input');


        return {


            clear: function(){
                $input.val('').removeAttr('data-lat').removeAttr('data-lng').removeAttr('data-airport');
                $('#distance').html('');
                App.map.reset();
            },

            autocomplete: function(){


                $.each($input, function(i, el){

                    $(el).autocomplete({
                        lookup: App.model.read(),
                        lookupFilter: function (suggestion, originalQuery, queryLowerCase) {
                            if(suggestion.name){
                                return suggestion.name.toLowerCase().indexOf(queryLowerCase) !== -1 || suggestion.code.toLowerCase().indexOf(queryLowerCase) !== -1;
                            }
                        },
                        formatResult: function (suggestion, currentValue) {
                            var reEscape = new RegExp('(\\' + ['/', '.', '*', '+', '?', '|', '(', ')', '[', ']', '{', '}', '\\'].join('|\\') + ')', 'g'),
                                pattern = '(' + currentValue.replace(reEscape, '\\$1') + ')';

                            return '<div><span>'+suggestion.code+' </span><p>' + suggestion.name.replace(new RegExp(pattern, 'gi'), '<em>$1<\/em>') + '</p></div>';
                        },
                        onSelect: function (suggestion) {

                            el.value = suggestion.name;
                            el.setAttribute('data-airport', suggestion.code);
                            el.setAttribute('data-lat', suggestion.lat);
                            el.setAttribute('data-lng', suggestion.lng);

                        },
                        appendTo: $(el).next(),
                        minChars: 3
                    });
                });

                return App;

            }

        }
    }());

    // Todo: Implement cache for memoization
    App.cache = (function(){

        var _cache = {};

        return {

        }
    }());

    App.model = (function(){

        var _data;

        return {
            load: function(url){
                $.ajax({
                    type: "GET",
                    url: "airports.json",
                    dataType: "json",
                    success: function (response) {
                        _data = response;
                        App.view.autocomplete();
                    }
                });
                return App;
            },

            read: function(){
                return _data;
            }
        }
    }());

    App.calculate = (function(){
        return {
            distance: function (lat1,lon1,lat2,lon2) {

                var deg2rad = function(deg) {
                        return deg * (Math.PI/180)
                    },

                    dLat = deg2rad(lat2-lat1),
                    dLon = deg2rad(lon2-lon1),
                    a =
                        Math.sin(dLat/2) * Math.sin(dLat/2) +
                            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
                                Math.sin(dLon/2) * Math.sin(dLon/2)
                    ,
                    c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

                    return ( ( 6371 * c ) * 0.621371 );
            }
       }
    }());

    App.map = (function(){

        var map,
            markers = [],
            bounds;

        return{
            init: function(){

                    map = new google.maps.Map(
                        document.getElementById('map-canvas'),
                        {
                            zoom: 2,
                            center: new google.maps.LatLng(41.850033, -87.6500523),
                            mapTypeId: google.maps.MapTypeId.SATELLITE
                        }
                    );

                    bounds = new google.maps.LatLngBounds();

            },

            mark: function(lat, lng, title){

                var mark = new google.maps.Marker({
                    position: new google.maps.LatLng(lat,lng),
                    map: map,
                    title: title
                });

                markers.push(mark);
            },

            center: function(){
                $.each(markers, function(i, mark){
                    bounds.extend(mark.getPosition());
                });

                map.setCenter(bounds.getCenter());
                map.fitBounds(bounds);
            },

            clear_markers: function(){
                $.each(markers, function(i, marker){
                    marker.setMap(null);
                });

                markers.splice(0, markers.length);
            },
            reset: function(){
                this.clear_markers();
                map.setCenter(new google.maps.LatLng(41.850033, -87.6500523));
                map.setZoom(2);
            }
        };

    }());

    App.load()
        .model.load()
        .events.on();

}());
