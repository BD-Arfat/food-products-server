const express = require("express");
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

app.get("/", (req, res) => {
    res.send("hi hello")
});
app.use(cors());
app.use(express.json());
require('dotenv').config()

//////////////////////


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.s0vwyit.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        const productCollection = client.db('food').collection('products');
        const drinkCollection = client.db('food').collection('drinkProducts');
        const sponsorCollection = client.db('food').collection('sponsor');
        const reviewCollection = client.db('food').collection('reviews');


        // products
        app.get('/product', async (req, res) => {
            const query = {};
            const cursor = productCollection.find(query).limit(6);
            const products = await cursor.toArray();
            res.send(products)
        });
        app.get('/products', async(req, res)=>{
            const query = {};
            const cursor = productCollection.find(query);
            const products = await cursor.toArray();
            res.send(products)
        });
        app.get('/products/:id', async(req, res)=>{
            const id = req.params.id;
            const query = {_id : new ObjectId(id)};
            const user = await productCollection.findOne(query);
            res.send(user)
        });
        
        // ebd products
        // drink
        app.get('/drink', async (req, res) => {
            const query = {};
            const cursor = drinkCollection.find(query).limit(6);
            const products = await cursor.toArray();
            res.send(products)
        });
        app.get('/drinks', async(req, res)=>{
            const query = {};
            const cursor = drinkCollection.find(query);
            const producs = await cursor.toArray();
            res.send(producs)
        });
        app.get('/drinks/:id', async(req, res)=>{
            const id = req.params.id;
            const query = {_id : new ObjectId(id)};
            const user = await drinkCollection.findOne(query);
            res.send(user)
        })
        // end drink
        // review
        app.post('/reviews',async(req, res)=>{
            const user = req.body;
            const result = await reviewCollection.insertOne(user);
            res.send(result)
        });
        app.get('/reviews', async(req, res)=>{
            const query = {};
            const cursor = reviewCollection.find(query);
            const users = await cursor.toArray();
            res.send(users)
        })
        app.get('/review', async(req, res)=>{
            const email = req.params.email;
            const query = {email : email};
            const result = await reviewCollection.find(query).toArray();
            res.send(result)
        });
        app.get('/reviews/:id', async(req, res)=>{
            const id = req.params.id;
            const query = {_id : new ObjectId(id)};
            const result = await reviewCollection.findOne(query);
            res.send(result)
        })
        app.delete('/review/:id', async(req, res)=>{
            const id = req.params.id;
            const query = {_id : new ObjectId(id)};
            const result = await reviewCollection.deleteOne(query);
            res.send(result)
        })
        // end review


        // sponsor 
        app.get('/sponsor', async(req, res)=>{
            const query = {};
            const cursor = sponsorCollection.find(query);
            const products = await cursor.toArray();
            res.send(products)
        })
        //end sponsor 

    } finally {

    }
}
run().catch(console.dir);


//////////////////////

app.listen(port, () => {
    console.log(`hi hello ${port}`)
})