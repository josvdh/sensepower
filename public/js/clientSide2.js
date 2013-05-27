var callSegmentation, checkForSenseSession, fillSensors, graph, plotSensorData, retrieveSensorTimespan, sense, showSensors;

sense = null;

graph = null;

checkForSenseSession = function() {
  if ($.cookie('session_id') != null) {
    $('#authenticate form button').html('Authenticated');
    $('#authenticate form .username').val($.cookie('username'));
    sense = new Sense($.cookie('session_id'));
    return showSensors();
  } else {
    return sense = new Sense;
  }
};

showSensors = function(list) {
  return fillSensors(list, function() {
    return $('#sensors').fadeIn();
  });
};

fillSensors = function(list, cb) {
  if (typeof list === 'function') {
    cb = list;
    list = null;
  }
  list || (list = '#sensors ul');
  return sense.sensors(function(err, resp) {
    var list_html, sensor, sorted_sensors, _i, _len;
    sorted_sensors = resp.object.sensors.sortBy(function(sensor) {
      return sensor.display_name;
    });
    list_html = '';
    for (_i = 0, _len = sorted_sensors.length; _i < _len; _i++) {
      sensor = sorted_sensors[_i];
      list_html += "<li><a href='' data-id='" + sensor.id + "' data-display='" + sensor.display_name + "'>" + sensor.display_name + " (" + sensor.id + ")</a></li>";
    }
    $(list).html(list_html);
    if (cb != null) {
      return cb();
    }
  });
};

retrieveSensorTimespan = function(id, cb) {
  var first_datapoint_call, last_datapoint_call;
  first_datapoint_call = function() {
    var defer;
    defer = $.Deferred();
    sense.sensorData(id, {
      per_page: 1
    }, function(err, resp) {
      return defer.resolve(resp.object.data[0]);
    });
    return defer.promise();
  };
  last_datapoint_call = function() {
    var defer;
    defer = $.Deferred();
    sense.sensorData(id, {
      last: true
    }, function(err, resp) {
      return defer.resolve(resp.object.data[0]);
    });
    return defer.promise();
  };
  return $.when(first_datapoint_call(), last_datapoint_call()).done(function(first, last) {
    return console.log('All data received', first, last);
  });
};

plotSensorData = function(id,t1,t2) {
  return sense.sensorData(id, {start_date:t1, end_date:t2, interval:60, per_page:1000}, function(err, resp) {
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
        label: 'Power',
        data: data
      }
    ]);
    return $('#actions').fadeIn();
  });
};

getDateTimeInput = function(label) {
  var t = $(label).val().match(/^(\d+)-(\d+)-(\d+) (\d+)\:(\d+)$/);
  dtnumber = new Date(t[1], t[2] - 1, t[3], t[4], t[5]).getTime()/1000;
  return dtnumber
};

callSegmentation = function(sensor, cb) {
  return $.ajax({
    url: '/work?sensor=' + sensor,
    headers: {
      session_id: $.cookie('session_id'),
      start_time: getDateTimeInput('#t1'),
      end_time: getDateTimeInput('#t2')
    }
  }).done(function(data) {
    graph.data.push({
      label: 'server data',
      data: data
    });
    return graph.redraw();
  });
};

$(function() {
  var container = document.getElementById('graph_container');
  graph = new links.Graph(container);
  checkForSenseSession();
  
  $('#navbar form').submit(function(e) {
    console.log("hello");
    var button, password, username;
    e.preventDefault();
    button = $(this).find('button');
    button.attr('disabled', 'disabled').html('...');
    username = $('#username').val();
    password = md5($('#password').val());
    return sense.createSession(username, password, function(err, resp) {
      // button.removeAttr('disabled').html('Sign Out');
      $('#authenticate').toggle();

      $.cookie('username', username);
      $.cookie('session_id', resp.object.session_id);
      return showSensors();
    });
  });
  
  $('#sensors .dropdown-menu').on('click', 'a', function(e) {
    var id;
    id = $(this).data('id');
    //plotSensorData(id,t1,t2);
    return false;
  });

  $('#actions .segment').on('click', function() {
    callSegmentation($('#sensors button').data('id'));
    return false;
  });  

  $('#parameters form').submit(function(e){
    var t1 = getDateTimeInput('#t1');
    var t2 = getDateTimeInput('#t2');
    var id = $('#sensors button').data('id');
    plotSensorData(id,t1,t2);
    return false
  });

  return $('.dropdown-menu').on('click', 'a', function(e) {
    var button, button_childs;
    button = $(this).closest('.btn-group').removeClass('open').find('button');
    button_childs = button.find('*');
    button.text($(this).data('display') + ' ').append(button_childs);
    return button.data('id', $(this).data('id'));
  });
});
