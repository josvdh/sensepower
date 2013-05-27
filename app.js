
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path');

var Sense = require("commonsense");

var index = require('./routes/index');
//var work  = require('./routes/work');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', index.index);

app.get('/work', function(req, res){
  var sense, sensor, session_id;
  sensor = req.query.sensor;
  session_id = req.headers.session_id;
  t1 = req.headers.start_time;
  t2 = req.headers.end_time;

  console.log(t1,t2);
  console.log(sensor);
  sense = new Sense(session_id);
  return sense.sensorData(sensor, {start_date:t1, end_date:t2, interval:60, per_page:1000}, function(err, resp) {
    var data, datum, i, len, ref;
    console.log('Error:', err);
    console.log('ikbenhier');
    data = [];
    ref = resp.object.data;
    for (i = 0, len = ref.length; i < len; i++) {
      datum = ref[i];
      data.push({
        date: datum.date * 1000,
        value: datum.value * 1.2 
      });
    }
    return res.json(data);
  });
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
