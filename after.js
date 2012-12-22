;(function() {
    function main(_) {
        var instance;
    
        function after(eventnames, callback) {
            var intersect = _.intersection(instance.events, eventnames);

            if (intersect.length === eventnames.length) {
                callback();
            } else {
                instance.binders.push({
                    events: eventnames.slice(0),
                    fn: callback
                });
            }
        }

        function happen(name, params) {
            if (_.indexOf(instance.events, name) < 0) {
                instance.events.push(name);
                var affected = _.filter(instance.binders, function(binder) {
                    if (_.indexOf(binder.events, name) >= 0)
                        return true;
                    return false;
                });
                var matched = _.filter(affected, function(binder) {
                    var intersect = _.intersection(instance.events, binder.events);
                    if (intersect.length === binder.events.length) {
                      return true;
                    }
                    return false;
                });
                instance.binders = _.difference(instance.binders, matched);
                for (var i=0, len=matched.length; i<len; i++) {
                    var binder = matched[i];
                    binder.fn();
                }
            } else {
                console.warn('Repeated event, "' + name + '", ignored.');
            }
        }
        
        function reset() {
          instance = {events: [], binders: []};
        }

        reset();
        return {after: after, happen: happen, reset: reset};
    }

    // handle requirejs
    if (typeof define === 'function' && define.amd) {
        define('after', ['underscore'], function(underscore) {
            return function() {
              return main(_);
            };
        });
        define('after-singleton', ['after'], function(after) {
            return after();
        });
    } else {
        window.after = function() {
            return main(_);
        };
    }
})();
