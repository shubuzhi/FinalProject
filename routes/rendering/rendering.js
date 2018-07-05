/**
*
*	Get route for index page
*
*/

exports.getMain = function(req, res) {
	if(!req.user)
	{
		res.render('login.html');
	}
	else
  res.render('main.html');
};
exports.get404 = function(req, res) {
  res.render('404.html');
};

exports.getPost = function(req,res) {
	if(!req.user)
	{
		res.render('login.html');
	}
	else
	res.render('post.html');
};
exports.getRequest = function(req,res) {
	if(!req.user)
	{
		res.render('login.html');
	}
	else
	res.render('request.html');
};
exports.getModifyRequest = function(req,res) {
	if(!req.user)
	{
		res.render('login.html');
	}
	else
	res.render('modifyrequest.html');
};
exports.getModifyPost = function(req,res) {
	if(!req.user)
	{
		res.render('login.html');
	}
	else
	res.render('modifypost.html');
};
exports.getPersonal = function(req,res) {
	if(!req.user)
	{
		res.render('login.html');
	}
	else
	res.render('personal.html');
};
exports.getReset = function(req,res) {
	res.render('reset.html');
};

exports.getTripDetail = function(req,res) {
	if(!req.user)
	{
		res.render('login.html');
	}
	else
	res.render('tripdetail.html');
};
exports.getRequestedTripDetail = function(req,res) {
	if(!req.user)
	{
		res.render('login.html');
	}
	else
	res.render('requestedtripdetail.html');
};
exports.getLogin = function(req,res) {
	res.render('login.html');
	//,{
	//	csrfToken : res.locals._csrf
	//});
};