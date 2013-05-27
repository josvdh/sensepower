// handler for simple page rendering
exports.index = function(req, res) {
    // if user is not logged in, ask them to login
    console.log('rendering page');
    res.render('index', { title: 'PowerHouse'});
}