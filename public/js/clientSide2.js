var callSegmentation, checkForSenseSession, fillSensors, plotSensorData, retrieveSensorTimespan, sense, showSensors;

sense = null;

var graph1 = null;
var graph2 = null;

checkForSenseSession = function() {
  if ($.cookie('session_id') != null) {
    $('#authenticate').hide();
    $('#logout').show();
    //$('#authenticate form button').html('Authenticated');
    $('#authenticate form .username').val($.cookie('username'));
    sense = new Sense($.cookie('session_id'));
    return false
  } else {
    return sense = new Sense;
  }
};

showSensors = function() {
  console.log("ikben hier");
  return sense.sensors(function(err, resp) {
    var select = document.getElementById('sensors');
    select.options.length = 0; // clear out existing items
    for(var i=0; i < resp.object.sensors.length; i++) {
        var sensor = resp.object.sensors[i];
        select.options.add(new Option(sensor.display_name,sensor.id));
    };
  });
};

plotSensorData = function(id,t1,t2,graph) {
  var samples = 1000;
  var st = Math.ceil((t2-t1)/samples);
  console.log(st);
  return sense.sensorData(id, {start_date:t1, end_date:t2, interval:st, per_page:samples}, function(err, resp) {
    var data, datum, _i, _len, _ref;
    data = [];  
    _ref = resp.object.data;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      datum = _ref[_i];
      data.push({
        date: new Date(datum.date * 1000),
        value: datum.value
      });
    }
    graph.draw([
      {
        label: 'sensordata',
        data: data
      }
    ],
      {
        // line : {color: color},
        start: t1*1000,
        end: t2*1000,
        min: t1*1000,
        max: t2*1000,
        legend : {
          width: "130px"
        }
      });
    graph.setValueRangeAuto();
    return $('#actions').fadeIn();
  });
};

getDateTimeInput = function(label) {
  var t = $(label).val().match(/^(\d+)-(\d+)-(\d+) (\d+)\:(\d+)$/);
  dtnumber = new Date(t[1], t[2] - 1, t[3], t[4], t[5]).getTime()/1000;
  return dtnumber
};

callSegmentation = function(sensor, factor, cb) {
  return $.ajax({
    url: '/work?sensor=' + sensor,
    headers: {
      session_id: $.cookie('session_id'),
      start_time: getDateTimeInput('#t1'),
      end_time: getDateTimeInput('#t2'),
      factor: factor
    }
  }).done(function(data) {
    console.log("ibh");
    graph1.data.push({
      label: 'server data',
      data: data
    });
    graph1.draw(graph1.data);
    graph1.setValueRangeAuto();
  });
};

$(function() {
  graph1 = new links.Graph(document.getElementById('graph_container1'));
  graph1.draw([],{start:1368000000000});

  graph2 = new links.Graph(document.getElementById('graph_container2'));
  graph2.draw([],{start:1368000000000}); 

  checkForSenseSession();
  $('#authenticate form').submit(function(e) {
    var button, password, username;
    e.preventDefault();
    button = $(this).find('button');
    button.attr('disabled', 'disabled').html('...');
    username = $('#username').val();
    password = md5($('#password').val());
    return sense.createSession(username, password, function(err, resp) {
      button.removeAttr('disabled').html('Sign Out');
      $.cookie('username', username);
      $.cookie('session_id', resp.object.session_id);
      $('#authenticate').toggle();
      $('#logout').toggle();
      return showSensors();
    });
  });
  
  $('#sensors .dropdown-menu').on('click', 'a', function(e) {
    var id;
    id = $(this).data('id');
    //plotSensorData(id,t1,t2);
    return false;
  });

  $('#methods #method1').on('click', function() {    callSegmentation(document.getElementById('sensors').value,0.8);
    return false;
  });  

  $('#methods #method2').on('click', function() {
    callSegmentation(document.getElementById('sensors').value,1.2);
    return false;
  });  

  $('#logout form').on('click', function() {
    console.log('logout');
    sense.deleteSession();
    $.removeCookie('session_id');
    $.removeCookie('username');
    $('#authenticate').toggle();
    $('#logout').toggle();
    return false;
  });  

  $('#parameters form').submit(function(e) { 
    var sensor = document.getElementById('sensors').value 
    var t1 = getDateTimeInput('#t1');
    var t2 = getDateTimeInput('#t2');
    console.log("parameters submitted:",t1,t2,sensor);
    plotSensorData(sensor,t1,t2,graph1);
    plotSensorData(318772,t1,t2,graph2);
    return false
  });
})