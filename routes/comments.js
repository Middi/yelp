var express = require("express");
var router = express.Router({mergeParams: true});
var Campground = require("../models/campgrounds");
var Comment = require("../models/comment");
var middleware = require("../middleware");


// Add new comment route
router.get("/new", middleware.isLoggedIn, function (req, res){
    Campground.findById(req.params.id, function(err, campground){
       if(err){
           console.log(err); 
       }
       else {
           res.render("comments/new", {campground: campground}); 
       }
    });
});


// Post Comment route
router.post("/", middleware.isLoggedIn, function(req, res){
    Campground.findById(req.params.id, function(err, campground){
       if(err){
           console.log(err); 
           res.redirect("/campgrounds");
       }
       else {
           Comment.create(req.body.comment, function(err, comment){
               if(err){
                req.flash("error", "Something went wrong.");
               }
               else {
                   // add username and id to comment
                   comment.author.id = req.user._id;
                   comment.author.username = req.user.username;
                   comment.save();
                   
                   campground.comments.push(comment);
                   campground.save();
                    req.flash("success", "Successfully added comment.");
                   res.redirect('/campgrounds/' + campground._id);
               }
               
           });
       }
       
    });
});


// Edit Comment

router.get("/:comment_id/edit", middleware.checkCommentUser, function(req, res){
    Comment.findById(req.params.comment_id, function(err, foundComments){
        if(err) {
            res.redirect("back");
        }
        else {
            res.render("comments/edit", {
                campground_id: req.params.id,
                comment: foundComments
            });
        }
        
    });
});


// Update Comment
router.put("/:comment_id", middleware.checkCommentUser, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if(err){
            req.flash("success", "Failed to update comment.");
            res.redirect('back');
        }
        else {
            req.flash("success", "Comment updated.");
            res.redirect('/campgrounds/' + req.params.id);
        }
    });
});


// Delete Comment
router.delete("/:comment_id", middleware.checkCommentUser, function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
       if(err){
           req.flash("error", "Failed to delete comment.");
           res.redirect("back");
       } 
       else {
           req.flash("success", "Comment deleted.");
           res.redirect('/campgrounds/' + req.params.id);
       }
    });
});


module.exports = router;