afterjs - Simple Event Aggregation API for JavaScript
=======

__afterjs__ is JavaScript utility that makes it slightly easier to wait for multiple events. 
One of the use cases is to defer execution of code until multiple dependencies is initialized.
It is especially helpful when one or more of the dependencies initialize asynchronously. 

It is compatible with, but not require, AMD such as `requirejs`.


### Example

Consider the following examples,

```JavaScript
require(['after-singleton', 'jQuery'], function(after, $) {
    $(document).bind('ready', function() {
        after.happen('dom-ready');
    });
});

require(['after-singleton', 'lib1'], function(after, lib1) {
    var mylib = lib1();
    mylib.bind('initialized', function() {
        after.happen('lib1-initialized');
    });
});

require(['after-singleton', 'jQuery'], function(after, $) {
    after.after(['dom-ready'], function() {
        $(body).find('#ads_container').load(ads_url, function() {
          after.happen('ads-loaded');
        });
    });
});

require(['after-singleton'], function(after) {
    after.after(['dom-ready', 'lib1-initialized', 'ads-loaded'], function() {
        /* code to be executed after all events "happened" */
    });
});
```

### Test
__afterjs__ is unit tested with `Evidence.js`. You can also run all tests on command line:

```bash
phantomjs lib/test/runner.coffee
```

### License
It is released under `BSD-Style License`. See LICENSE.txt.
