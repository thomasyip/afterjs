;(function() {
    var DEBUG = true;
    var DEFAULT_TIMEOUT = 30 * 1000;

    function main(_) {
        var instance;
        var timeout = null;

        function touchTimer() {
            !timeout || clearTimeout(timeout);
            timeout = setTimeout(function() {
                dumpStatus();
            }, DEFAULT_TIMEOUT);
        }
        
        function stopTimer() {
            !timeout || clearTimeout(timeout);
            timeout = null;
        }
        
        function dumpStatus() {
            var msg = 'There is one or more listener who has not be notified. ';
            msg += 'for at least ' + DEFAULT_TIMEOUT + 'ms. \n';
  
            if ('JSON' in window) {
                 msg += 'Listeners: ' + JSON.stringify(instance.binders) + '\n';
                 msg += 'Happned events: ' + JSON.stringify(instance.events);
            } else {
                 msg += 'We wanted to tell you which one, but your browser does ';
                 msg += 'not support JSON.';
            }
            DEBUG && console.warn(msg);
        }

        function after(eventnames, callback) {
            var intersect = _.intersection(instance.events, eventnames);

            if (intersect.length === eventnames.length) {
                callback();
            } else {
                instance.binders.push({
                    events: eventnames.slice(0),
                    fn: callback
                });
                touchTimer();
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
                
                if (instance.binders.length > 0) {
                    touchTimer();
                } else {
                    stopTimer();
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

    if (typeof define === 'function' && define.amd) {
        define(['underscore'], function(us) {
            return main(us);
        });
    } else {
        window.after = function() {
            return main(_);
        };
    }
})();
