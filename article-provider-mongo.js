var db = require('mongodb').Db;
var connection = require('mongodb').Connection;
var server = require('mongodb').Server;
var bson = require('mongodb').BSON;
var objectId = require('mongodb').ObjectID;

/**
Creating the Database
**/

ArticleProvider = function(host,port){
	this.db = new db('node-mongo-blog', new server(host,port,{auto_reconnect:true},{}));
};

/**
Getting the posts
**/

ArticleProvider.prototype.getCollection = function(callback) {
	this.db.collection('articles',function(error,article_collection){
		if(error) callback(error)
		else callback(null, article_collection);
	});
};

/**
Getting all the posts, ordered by creation time.
**/

ArticleProvider.prototype.findAll = function(callback){
	this.getCollection(function(error,article_collection){
		if(error) callback(error)
		else {
			article_collection.find().sort({created_at : -1}).toArray(function(error,results){
				if(error) callback(error)
					else callback(null,results);
			});
		}
	});
};

/**
Getting one post, by id
**/

ArticleProvider.prototype.findById = function(id,callback){
	this.getCollection(function(error,article_collection){
		if (error) callback(error)
		else {
			//console.log(article_collection.db.bson_serializer);
			article_collection.findOne({_id : article_collection.db.bson_serializer.ObjectID.createFromHexString(id)},function(error,result){
				if(error) callback(error)
					else callback(null,result);
			});
		}
	});
}

/**
Search method to search posts, by the title
**/

ArticleProvider.prototype.findByTitle = function(string,callback){
	//console.log("Stringa Cercata : " +string);
	this.getCollection(function(error,article_collection){
		if(error) callback(error)
			else {

				var query = new RegExp(string,'i');
				
				article_collection.find({title:query}).sort({created_at : -1}).toArray(function(error,results){
					//console.log(results);
					if(error) callback(error)
						else callback(null,results);
				});
			}
	});
}

/**
Saving one post
**/

ArticleProvider.prototype.save = function(articles,callback) {
	this.getCollection(function(error,article_collection){
		if (error) callback(error)
			else {


							if(articles['title'].length > 0 && articles['body'].length >0)
								{

									if(typeof(articles.length)=="undefined")
									articles = [articles];
									for(var i = 0; i < articles.length; i++){
									article = articles[i];
									article.created_at = new Date();
									
									if(article.comments === undefined)
										article.comments = [];
									for(var j = 0; j<article.comments.length; j++)
											article.comments[j].created_at = new Date();
										}
									article_collection.insert(articles,function(){
										callback(null,articles);
									});
								} else callback(error);

			}

	});
}

/**
Update a post
**/

ArticleProvider.prototype.update = function(articleId,articles,callback){

console.log('updating');
this.getCollection(function(error,article_collection){
	if(error) callback(error)
		  else {
		        	article_collection.update(
							{_id: article_collection.db.bson_serializer.ObjectID.createFromHexString(articleId)},
							articles,
							function(error, articles) {
								if(error) callback(error);
								else callback(null, articles)       
							});
      			}
});

}

/**
Deleting one post, by id
**/

ArticleProvider.prototype.delete = function (id,callback){
	console.log('deleting');
	this.getCollection(function(error,article_collection){
		if(error) callback(error);
			else {
				article_collection.remove(
					{_id: article_collection.db.bson_serializer.ObjectID.createFromHexString(id)},
						function(error,id){
							if(error) callback (error);
							else callback(null,id);
						}
					);
			}
	});
}

/**
Saving a comment to a post
**/

ArticleProvider.prototype.addCommentToArticle = function(articleId,comment,callback){
	this.getCollection(function(error,article_collection){
		if(error) callback(error)
			else {
				console.log(articleId + ", " + comment);
				if(typeof(comment)!="undefined" && typeof(comment.length) != "undefined"){
					//debugger;
					article_collection.update(
						{_id:article_collection.db.bson_serializer.ObjectID.createFromHexString(articleId)},
						{"$push":{comments:comment}},
							function(error,article){
								
								if(error)callback(error);
								else callback(null,article)
							}
						);
				}else callback(null,"Comment empty");
				
			}
	});
}

/**
Exporting the model
**/

exports.ArticleProvider = ArticleProvider;