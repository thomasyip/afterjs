# Test runner for PhantomJS <phantomjs.org>
# Usage:
#   $ phantomjs lib/test/runner.coffee [<page1>, <page2>, ...]
#
# When no test pages specified, runs all automated tests.
#
# (Adopted and modified from `github.com/madrobby/zepto`)

system = require('system')
fs = require('fs')

if system.args.length > 1
  # list of test pages to run
  suites = system.args.slice(1)
else
  # by default, run all test/unit/*.html pages
  modules = 'after after-with-requirejs'.split /\s+/
  suites = modules.map (name)-> "test/unit/#{name}.html"

page = require('webpage').create()

page.onConsoleMessage = (msg) ->
  console.log msg

page.onError = (msg, trace) ->
  console.log 'ERROR: ' + msg

# used for waiting until the tests finish running
waitFor = (testFn, onReady, timeout=3000) ->
  start = new Date()
  interval = setInterval ->
    if testFn()
      clearInterval interval
      onReady()
    else if new Date() - start > timeout
      console.log "timed out."
      phantom.exit(1)
  , 100

loadNextSuite = ->
  if not suites.length
    phantom.exit()
  else
    url = suites.shift() + "?verbosity=WARN"
    # PhantomJS chokes on the query string on relative paths
    url = "file://#{fs.workingDirectory}/#{url}" if not /:\/\//.test url

    page.open url, (status) ->
      if status isnt "success"
        console.log "failed opening #{url}"
        phantom.exit(1)

      waitFor ->
        page.evaluate ->
          # the "#results" element needs to have the "finished" class
          res = document.getElementById 'results'
          /finished/.test res.className if res
      , ->
        passed = page.evaluate ->
          res = document.getElementById 'results'
          paths = location.pathname.split('/')
          # echo test results to the console
          console.log "#{paths[paths.length - 1]} - " + res.textContent
          /passed/.test res.className

        if passed
          loadNextSuite()
        else
          phantom.exit(1)

loadNextSuite()
