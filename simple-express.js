//dependencies

var express = require ('express'),
				stylus  = require ('stylus');
var ArticleProvider = require('./article-provider-mongo').ArticleProvider;
var app = express();
function compile(str, path) {
  return stylus(str)
    .set('filename', path)
    .use(nib())
}

//configuration

app.configure(function(){

	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(require('stylus').middleware({src:__dirname+'/public'}));
	app.use(app.router);
	app.use(express.static(__dirname + '/public'));

});

//definind environments [Development, Production]

app.configure('development',function(){
	app.use(express.errorHandler({dumpExceptions:true, showStack: true}));
});

app.configure('production', function(){
	app.use(express.errorHandler());
});


//init
var articleProvider = new ArticleProvider('localhost',27017);

//routes

app.get('/',function(req,res){
	articleProvider.findAll(function(error,docs){
		//res.send(docs);
		res.render("index.jade",{
			pageTitle:'Blog',
			articles:docs
			}
		)
	});

});

//filter posts after search
app.get('/search',function(req,res){
	articleProvider.findByTitle(req.param('sq'),
		function(error,docs){
			//console.log(docs);
			res.render("search.jade",{
				pageTitle:'Blog',
				articles:docs
			});
		});
});


/** 
new post
**/
app.get('/blog/new',function(req,res){
	res.render("new_post.jade",{
		pageTitle:"New Post"
	});
});

app.post('/blog/new',function(req,res){
	articleProvider.save({
		title: req.param('title'),
		body: req.param('body')
	},function(error,docs){
		res.redirect('/');
	});
});

/**
View one post
**/
app.get('/blog/:id',function(req,res){
	articleProvider.findById(req.params.id,function(error,article){
		res.render('blog_show.jade',{
			pageTitle: article.title,
			article:article
		});
	});
});

/**
Add a comment
**/

app.post('/blog/addComment',function(req,res){
	articleProvider.addCommentToArticle(req.param('_id'),{
		person : req.param('person'),
		comment : req.param('comment'),
		created_at : new Date()
	},function(error,docs){
		res.redirect('/blog/'+req.param('_id'));
	});
});

/**
Edit a post
**/

app.get('/blog/:id/edit', function(req,res){
	articleProvider.findById(req.params.id,function(error,article){
		res.render('edit.jade',{
			pageTitle: article.title,
			article:article
		});
	});
});

app.post('/blog/:id/edit',function(req,res){

	articleProvider.update(req.param('id'),{
		title: req.param('title'),
		body:req.param('body')
	},function(error,docs){
		res.redirect('/');
	});

});

/**
Delete post
**/

app.get('/blog/:id/delete',function(req,res){

	articleProvider.delete(req.param('id'),
		function(error,docs){
			res.redirect('/');
	});

});


var port = process.env.PORT || 3000;
app.listen(port);
