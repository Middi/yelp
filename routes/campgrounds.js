var express = require("express");
var router = express.Router();
var Campground = require("../models/campgrounds");
var middleware = require("../middleware");

// =======================
// ROUTES
// =======================



// INDEX ROUTE Show all campgrounds
router.get('/', function(req, res){
    //get campgrounds from DB
    Campground.find({}, function(err, allCampgrounds){
        if(err){
            console.log(err);
        }
        else {
            
            res.render('campgrounds/index', {
                campgrounds: allCampgrounds
            });
        }
    });
});


// CREATE - Add new campground to database
router.post('/', middleware.isLoggedIn, function(req, res){
    var name = req.body.name;
    var image = req.body.image;
    var price = req.body.price;
    var description = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    var newCampground = {name: name, image: image, description: description, price: price, author: author};

    Campground.create(newCampground, function(err, newlyCreated){
        if(err) {
            console.log(err);
        }
        else {
            req.flash("success", "Campground added.");
            res.redirect('/campgrounds');
        }
    });
    
});

// NEW ROUTE - Show form to create new database entry
router.get('/new', middleware.isLoggedIn, function(req, res){
    res.render('campgrounds/new.ejs');
});

// SHOW MORE INFO ROUTE
router.get('/:id', function(req, res){
    //find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err){
            req.flash("error", "Campground could not be added.");
        }
        else {
            //render show template with that campground
            res.render('campgrounds/show', {
                campground: foundCampground
                
            });
        }
    });
});

// Edit Campground

router.get("/:id/edit", middleware.checkCampgroundUser, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
        if(err){
            req.flash("error", "Campground not found.");
        }
        res.render("campgrounds/edit", {
            campground: foundCampground
        });
    });
});


// Update Campground
router.put("/:id", middleware.checkCampgroundUser, function(req, res){
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
        if(err){
            req.flash("error", "You do not have permission to do that.");
            res.redirect('/campgrounds/' + req.params.id + 'edit');
        }
        else {
            req.flash("success", "Campground Updated.");
            res.redirect('/campgrounds/' + req.params.id);
        }
    });
});


// Delete Route
router.delete("/:id", middleware.checkCampgroundUser, function(req, res){
    Campground.findByIdAndRemove(req.params.id, function(err){
       if(err){
           console.log(err);
           res.redirect("/campgrounds");
       } 
       else {
           res.redirect("/campgrounds");
       }
    });
});



module.exports = router;