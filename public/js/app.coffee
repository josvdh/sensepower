#= require ../components/commonsense/lib/commonsense.js
#= require ../components/JavaScript-MD5/md5.min.js

sense = null

checkForSenseSession = () ->
  if $.cookie('session_id')?
    $('#authenticate form button').html 'Authenticated'
    $('#authenticate form .username').val $.cookie('username')
    sense = new Sense $.cookie('session_id')
    showDevices()
  else
    sense = new Sense


showDevices = (list) ->
  fillDevices list, ->
      $('#devices').fadeIn()

fillDevices = (list, cb) ->
  if typeof list is 'function'
    cb = list
    list = null
  list ||= '#devices ul'

  sense.devices (err, resp) ->
    list_html = ''
    list_html += "<li><a href='' data-id='#{device.id}' data-display='#{device.type}'>#{device.type} (#{device.id})</a></li>" for device in resp.object.devices
    $(list).html list_html

    # Simulate click of only a single device
    if resp.object.devices.length == 1
      $(list).find('a').click()

    cb() if cb?

showSensors = (device, list) ->
  fillSensors device, list, ->
    $('#sensors').fadeIn()

fillSensors = (device, list, cb) ->
  if typeof list is 'function'
    cb = list
    list = null
  list ||= '#sensors ul'

  sense.deviceSensors device, (err, resp) ->
    sorted_sensors = resp.object.sensors.sortBy (sensor) -> sensor.display_name
    list_html = ''
    list_html += "<li><a href='' data-id='#{sensor.id}' data-display='#{sensor.display_name}'>#{sensor.display_name} (#{sensor.id})</a></li>" for sensor in sorted_sensors
    $(list).html list_html
    cb() if cb?


retrieveSensorTimespan = (id, cb) ->

  sense.sensorData id, {per_page: 1}, (err, resp) ->
    console.log 'First item:', resp.object

  sense.sensorData id, {last: true}, (err, resp) ->
    console.log 'Last item:', resp.object

$ ->

  checkForSenseSession()


  $('#authenticate form').submit (e) ->
    e.preventDefault()

    button = $(@).find('button')
    button.attr('disabled', 'disabled').html 'Authenticating...'

    username = $('#username').val()
    password = md5 $('#password').val()

    sense.createSession username, password, (err, resp) ->
      button.removeAttr('disabled').html 'Authenticated'

      $.cookie 'username', username
      $.cookie 'session_id', resp.object.session_id

      showDevices()


  $('#devices .dropdown-menu').on 'click', 'a', (e) ->
    showSensors $(@).data('id')
    return false

  $('#sensors .dropdown-menu').on 'click', 'a', (e) ->
    sense.sensorData $(@).data('id'), (err, resp) ->
      # console.log resp.object
      retrieveSensorTimespan()
    return false;

  # Replace dropdown value with selected value
  $('.dropdown-menu').on 'click', 'a', (e) ->
    button = $(@).closest('.btn-group').removeClass('open').find('button')
    button_childs = button.find('*')
    button.text($(@).data('display') + ' ').append button_childs
