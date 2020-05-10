//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose=require("mongoose"); 
const app = express();
const _ = require("lodash");
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://Mrinal_Khemka:mrinal2905@cluster0-k0ary.mongodb.net/todolistDB",{useNewUrlParser:true});
const day = date.getDate();
const workItems = [];
const itemSchema=new mongoose.Schema(
  { 
    name:{
      type:String,
      required:true
    }

  }
);
const Item=mongoose.model("Item",itemSchema);
const eat=new Item({
  name:"Eat"
 });

const study=new Item({
  name:"Study"
 });
const defaultItems=[eat,study];
const listSchema={
  name: String,
  items:[itemSchema]
}
 const List= mongoose.model("List",listSchema);
app.get("/", function(req, res) {
  
  Item.find({},function(err,items)
  {
    if(items.length===0)
    {
      Item.insertMany(defaultItems,function(err)
       {
        if(err)
       console.log(err);
       else
       console.log("inserted successfully");
       }); 
       res.redirect("/");
    }
    else{
    res.render("list", {listTitle: day, newListItems: items});
    }

  });


  
});
app.get("/:customListName",function(req,res)
{
    const customListName=req.params.customListName;
    List.findOne({name:customListName},function(err,foundList)
    {
     if(!err)
     {
       if(!foundList)
       {
        const list=new List({
          name:customListName,
          items:defaultItems
         });
         list.save();
         res.redirect("/"+customListName);
       }
       else{
         const uListName=_.upperFirst(foundList.name);
       res.render("list",{listTitle: uListName, newListItems:foundList.items});
       }
     }
    });
    
});
app.post("/", function(req, res){

  const item = req.body.newItem;
  const list= req.body.list;
  const newItem=new Item({
    name:item
   });
    if(list===day){
    newItem.save();
    res.redirect("/");
   }
   else{
     List.findOne({name:list},function(err,foundList)
     {
       foundList.items.push(newItem);
       foundList.save();
       res.redirect("/" + list);
     });
   }
   if(newItem!="")
   {
  
   }
   console.log(newItem);
    

});
app.post("/delete",function(req,res)
{
  const check=req.body.checkBox;
  const listName=req.body.listName;
  if(listName===day)
  {
    Item.findByIdAndRemove(check,function(err)
  {
    if(err)
    console.log(err);
    else
    console.log("successfully deleted");
     
    res.redirect("/");
    
  });
  }
  else{
    List.findOneAndUpdate({name:listName} , {$pull: {items: {_id: check}}},function(err,foundList)
    {
           if(!err)
            res.redirect("/" +listName);
    });
  }
  
  
});
// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

// app.get("/about", function(req, res){
//   res.render("about");
// });

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
