var Sense;

Sense = require('commonsense');

exports.index = function(req, res) {
  var sense, sensor, session_id;
  sensor = req.query.sensor;
  session_id = req.headers.session_id;
  sense = new Sense(session_id);
  return sense.sensorData(sensor, function(err, resp) {
    var data, datum, i, len, ref;
    console.log('Error:', err);
    data = [];
    ref = resp.object.data;
    for (i = 0, len = ref.length; i < len; i++) {
      datum = ref[i];
      data.push({
        date: datum.date * 1000,
        value: datum.value * 2
      });
    }
    return res.json(data);
  });
};