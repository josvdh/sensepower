var Sense = require("commonsense");

// handler for homepage
exports.home = function(req, res) {
    console.log(req.session);
    // if user is not logged in, ask them to login
    if (typeof req.session.session_id == 'undefined') res.render('home', { title: 'PowerHouse'});
    // if user is logged in already, take them straight to the items list
    else res.redirect('/items');
};

exports.homePostWork = function(req, res) {
    // load md5 hash method
    md5 = require("blueimp-md5").md5;
    sense = new Sense();
    // if the username is not submitted, give it a default of "Anonymous"
    username = req.body.username || 'Anonymous';
    password = md5(req.body.password) || 'undefined';
    // store the username as a session variable
    req.session.username = username;

    sense.createSession(username,password, function(err, resp){
        req.session.session_id = resp.object.session_id;
        res.redirect('/');
    });
};

// our 'database'
var items = {
    SKN:{name:'Shuriken', price:100},
    ASK:{name:'Ashiko', price:690},
    CGI:{name:'Chigiriki', price:250},
    NGT:{name:'Naginata', price:900},
    KTN:{name:'Katana', price:1000}
};

// handler for displaying the items
exports.items = function(req, res) {
    // don't let nameless people view the items, redirect them back to the homepage
    if (typeof req.session.username == 'undefined') res.redirect('/');
    else res.render('items', { title: 'Ninja Store - Items', username: req.session.username, items:items });
};

// handler for displaying individual items
exports.item = function(req, res) {
    // don't let nameless people view the items, redirect them back to the homepage
    if (typeof req.session.username == 'undefined') res.redirect('/');
    else {
        var name = items[req.params.id].name;
        var price = items[req.params.id].price;
        res.render('item', { title: 'Ninja Store - ' + name, username: req.session.username, name:name, price:price });
    }
};

// handler for showing monitor page
exports.monitor = function(req, res) {
    console.log(req.session.session_id);
    sense = new Sense(req.session.session_id);

    sense.sensorData(318772,function(err,resp){
        var sensordata = [];
        var datum = [];
        var dataset = [];

        for (var index in resp.object.data) {
            sensordata.push(parseFloat(resp.object.data[index].value));
            datum.push(resp.object.data[index].date*1000);
        }

        // Both loops can be combined but this one allows data manipulation outside the loops if places here.

        for (index in sensordata) {
            dataset.push({
                value : sensordata[index],
                date : datum[index]
            })
        }
        console.log(dataset);
        res.render('monitor', { title: 'Ninja Store', dataset: dataset});
    });       
};