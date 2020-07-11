const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
// const date = require(__dirname + "/date.js")
const { urlencoded } = require("body-parser");
const app = express();




app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin:admin@cluster0.qufvp.mongodb.net/itemsDB?retryWrites=true&w=majority", { useNewUrlParser: true });

const itemsSchema = new mongoose.Schema({

    name: String

});

const Item = mongoose.model("Item", itemsSchema);
const item1 = new Item({
    name: "Welcome to TOdoList App"
});

const item2 = new Item({
    name: "Hit the + button to add a new item"
});

const item3 = new Item({
    name: " <--Hit this to delete an item"

});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
}

const List = mongoose.model("List", listSchema);





app.get("/", function (req, res) {
    //   const day = date.getDate();
    Item.find({}, function (err, foundItems) {

        if (foundItems.length === 0) {

            Item.insertMany(defaultItems, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Successfully inserted data into DB");
                }
            });
            res.redirect("/");

        } else {

            res.render("list", { listTitle: "Today", addedTasks: foundItems });

        }





    });

});

app.get("/:customListName", function (req, res) {

    
    const customListName = _.capitalize(req.params.customListName);
    List.findOne({ name: customListName }, function (err, foundList) {
        if (!err) {
            if (!foundList) {
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                res.redirect("/" + customListName);


                list.save();
            } else {
                res.render("list", { listTitle: foundList.name, addedTasks: foundList.items });

            }
        }
    });




});





app.post("/", function (req, res) {

    const itemName = req.body.newItem;
    const listName = req.body.list;


    const task = new Item({ name: itemName });

    if (listName === "Today") {
        task.save();
        res.redirect("/");

    } else {
        List.findOne({ name: listName }, function (err, foundList) {
            foundList.items.push(task);
            foundList.save();
            res.redirect("/" + listName);
        });
    }




});

app.post("/delete", function (req, res) {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;
    if (listName === "Today") {
        Item.findByIdAndRemove(checkedItemId, function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log("Deleted Success fully fully fully");
                res.redirect("/");
            }

        });
    } else {
        List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } }, function (err, foundList) {
            if (!err) {
                res.redirect("/" + listName);
            }
        });

    }

});
    









let port = process.env.PORT;
if (port == null || port == "") {
  port = 1337;
}


app.listen(port, function () {
    console.log("server has been setted up successfully...");
})
