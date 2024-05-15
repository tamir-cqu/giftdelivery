const express = require("express");
var cors = require("cors");
const app = express();
const port = 3000;

// These lines will be explained in detail later in the unit
app.use(express.json()); // process json
app.use(express.urlencoded({ extended: true }));
app.use(cors());
// These lines will be explained in detail later in the unit

const MongoClient = require("mongodb").MongoClient;
const uri =
  "mongodb+srv://cqu:Qwer1234@cluster0.vc0wils.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
// Global for general use
var userCollection;
var orderCollection;

client.connect((err) => {
  userCollection = client.db("giftdelivery").collection("users");
  orderCollection = client.db("giftdelivery").collection("orders");

  // perform actions on the collection object
  console.log("Database up!\n");
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/getUserDataTest", (req, res) => {
  userCollection
    .find({}, { projection: { _id: 0 } })
    .toArray(function (err, docs) {
      if (err) {
        console.log("Some error.. " + err + "\n");
      } else {
        console.log(JSON.stringify(docs) + " have been retrieved.\n");
        var str = docs;
        res.send(str);
      }
    });
});

app.get("/getOrderDataTest", (req, res) => {
  orderCollection
    .find({}, { projection: { _id: 0 } })
    .toArray(function (err, docs) {
      if (err) {
        console.log("Some error.. " + err + "\n");
      } else {
        console.log(JSON.stringify(docs) + " have been retrieved.\n");
        var str = docs;
        res.send(str);
      }
    });
});

app.post("/verifyUser", (req, res) => {
  loginData = req.body;
  console.log(loginData);

  userCollection
    .find(
      { email: loginData.email, password: loginData.password },
      { projection: { _id: 0 } }
    )
    .toArray(function (err, docs) {
      if (err) {
        console.log("Some error.. " + err + "\n");
      } else {
        console.log(JSON.stringify(docs) + " have been retrieved.\n");
        res.status(200).send(docs);
      }
    });
});

app.get("/getOrderData", (req, res) => {
  let filter = req.query;

  orderCollection
    .find(filter, { projection: { _id: 0 } })
    .toArray(function (err, docs) {
      if (err) {
        console.log("Some error.. " + err + "\n");
      } else {
        console.log(JSON.stringify(docs) + " have been retrieved.\n");
        res.json(docs);
      }
    });
});

app.post("/postOrderData", function (req, res) {
  console.log("POST request received : " + JSON.stringify(req.body));

  orderCollection.insertOne(req.body, function (err, result) {
    if (err) {
      console.log("Some error.. " + err + "\n");
    } else {
      console.log(JSON.stringify(req.body) + " have been uploaded\n");
      res.send(JSON.stringify(req.body));
    }
  });
});

app.post("/postUserData", function (req, res) {
  console.log("POST request received : " + JSON.stringify(req.body));

  // Assume req.body contains a unique identifier like 'email'
  const userEmail = req.body.email;

  // Check if user already exists
  userCollection.findOne({ email: userEmail }, function (err, existingUser) {
    if (err) {
      console.log("Error checking user existence: " + err);
      res.status(500).send("Internal server error");
    } else if (existingUser) {
      console.log("User already exists: " + JSON.stringify(existingUser));
      res.status(400).send("User already exists");
    } else {
      // Insert the new user since they don't exist
      userCollection.insertOne(req.body, function (err, result) {
        if (err) {
          console.log("Some error.. " + err + "\n");
          res.status(500).send("Error inserting user data");
        } else {
          console.log(JSON.stringify(req.body) + " have been uploaded\n");
          res.send(JSON.stringify(req.body));
        }
      });
    }
  });
});

app.delete("/deleteOrders", async (req, res) => {
  let filter = req.body;
  try {
    const result = await orderCollection.deleteMany(filter);

    res.status(200).json({
      message: "Orders deleted successfully.",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting orders:", error);
    res
      .status(500)
      .json({ message: "An error occurred while deleting orders." });
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
