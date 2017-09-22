* Environment set up in C9, simply selected node template (installed node and npm for me)
* Deleted all default folders and files
* `mkdir FirstExpressApp`, `touch app.js`, run with `node app.js`
* `npm install express`

package.json
* holds data relevant to project (like name, version, github link, and dependencies)
* create one using `npm init`
* `npm install _____ --save` will automatically add that package as a dependency in package.json

```javascript
var express = require("express");
var app = express();

//tell express to serve public directory as well
app.use(express.static("public"));

//use to avoid writing .ejs after all templates
//app.set("view engine", "ejs");

app.get("/", function(req, res){
    res.send("Hi there!");
});

app.get("/hello/:thing", function(req, res){
    var thing = req.params.thing
    res.render("page1.ejs", {thingVar: thing})
})

// //need npm install body-parser plus code at the top
app.post("/add", function(req,res){
    console.log(req.body);
    res.redirect("/hello/redirected")
});

//404 catch-all, MUST be after all other routes
app.get("*", function(req,res){
    res.send("404 page not found");
});

//tell express to listen for requests (start server)
//parameters here are specific for cloud 9 port and IP variables
app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server has started!");
});
```
* anything with : in front will become a route variable (aka path param)
* req contains all info about request, including params (like path params)
* order of routes matters, first matching route will be run
* `npm install body-parser` for reading body data from request

ejs = embedded javascript (dynamic html template)
* express looks for templates in "views" folder
* `npm install ejs`
* put js code inside <%=  %>
* <link rel="stylesheet" href="style.css"> (style.css is in "public" folder)




installed mongodb (https://community.c9.io/t/setting-up-mongodb/1717)
installed mongoose
installed passport, passport-local, passport-local-mongoose
installed express-session

two ways to add to database:

```javascript
var userSchema = new mongoose.Schema({
    username: String,
    funds: Number
})
var User = mongoose.model("User", userSchema); //compile schema into a model

//METHOD 1
//adding a new user to the db
var henry = new User({
    username: "henry",
    funds: 100
})
henry.save(function(err, user){
    if(err){
        console.log("ERROR saving to db");
    } else {
        console.log("user saved to db");
    }
});

//METHOD 2
User.create({
    username: "henry2",
    funds: 100
}, function(err,user){
    if(err){
        console.log("ERROR saving to db");
    } else {
        console.log("user saved to db");
    }
})
```




At first it seemed like a smart idea to update property values (like inventory) on get requests, so as soon as you actually want to look at the value it will calculate it and update for you.
But, because the data is displayed in multiple places, I think it would be better to just update everything periodically. Otherwise, your table updates every time you click on "manage" for
a property, which is a little strange.





Thursday Sept 21 - picking up again!
* took everything from cloud9, pushed to a git repo and pulled down onto my computer
* ran npm install on existing package.json, seemed to install everything it needed
* had to install mongodb using brew (seems like it was already installed)
* mongodb to start db
* nodemon app.js to start app
  * just had to change one line to use port 8080 on localhost instead of process.env.PORT and process.env.IP which I think is just from cloud9
* boom it actually works! (although I did git check out an earlier commit)
