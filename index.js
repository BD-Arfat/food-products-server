const express = require("express");
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const jwt = require('jsonwebtoken')

app.get("/", (req, res) => {
    res.send("hi hello")
});
app.use(cors());
app.use(express.json());
require('dotenv').config();


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

function verifyJWT(req, res, next) {
    console.log('token', req.headers.authorization);
    const authHeadr = req.headers.authorization;
    if (!authHeadr) {
        return res.send(401).send(`unauthorized access`)
    };

    const token = authHeadr.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded;
        next()
    })

}

async function run() {
    try {
        const productCollection = client.db('food').collection('products');
        const drinkCollection = client.db('food').collection('drinkProducts');
        const sponsorCollection = client.db('food').collection('sponsor');
        const reviewCollection = client.db('food').collection('reviews');
        const usersCollection = client.db('food').collection('users');
        const ordersCollection = client.db('food').collection('orders');
        const addProductCollection = client.db('food').collection('addProduct');


        // users
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result)
        });
        app.get('/users', async (req, res) => {
            const query = {};
            const cursor = usersCollection.find(query);
            const users = await cursor.toArray();
            res.send(users)
        });
        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await usersCollection.deleteOne(query);
            res.send(result);
        });
        app.get('/users/admin/:email', async (req, res)=>{
            const email = req.params.email;
            const query = {email : email};
            const user = await usersCollection.findOne(query);
            res.send({isAdmin: user?.role === 'admin'})
        })
        app.put('/users/admin/:id', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const query = {email : decodedEmail};
            const user = await usersCollection.findOne(query);

            if(user?.role !== "admin"){
                return res.status(403).send({message : 'forbidden accessToken'})
            }


            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    role: 'admin'
                }
            }
            const result = await usersCollection.updateOne(filter, updatedDoc, options);
            res.send(result)
        })
        //end users
        // orders
        app.post('/orders', async (req, res) => {
            const user = req.body;
            const result = await ordersCollection.insertOne(user);
            res.send(result)
        });
        app.get('/orders', async (req, res) => {
            const query = {};
            const cursor = ordersCollection.find(query);
            const users = await cursor.toArray();
            res.send(users)
        });
        app.get('/order', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const result = await ordersCollection.find(query).toArray();
            res.send(result)
        });
        app.delete('/order/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);
            res.send(result)
        })
        // end orders

        // JWT
        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '1h' });
                return res.send({ accessToken: token })
            }
            res.status(403).send({ accessToken: '' })
        })
        // END jwt

        // products
        app.post('/product', async (req, res) => {
            const user = req.body;
            const result = await productCollection.insertOne(user);
            res.send(result)
        })
        app.get('/product', verifyJWT, async (req, res) => {
            const email = req.query.email;
            const decodedEmail = req.decoded.email;
            if (email !== decodedEmail) {
                return res.status(403).send({ message: 'forbidden access' })
            }
            const query = { email: email };
            const result = await productCollection.find(query).toArray();
            res.send(result)
        });
        app.delete('/product/:id', async (req, res) => {
            const id = req.params.id;
            const qurey = { _id: new ObjectId(id) };
            const result = await productCollection.deleteOne(qurey);
            res.send(result)
        })
        app.get('/Limitproduct', async (req, res) => {
            const query = {};
            const cursor = productCollection.find(query).limit(6);
            const products = await cursor.toArray();
            res.send(products)
        });
        app.get('/products', async (req, res) => {
            const query = {};
            const cursor = productCollection.find(query);
            const products = await cursor.toArray();
            res.send(products)
        });
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
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
        app.get('/drinks', async (req, res) => {
            const query = {};
            const cursor = drinkCollection.find(query);
            const producs = await cursor.toArray();
            res.send(producs)
        });
        app.get('/drinks/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const user = await drinkCollection.findOne(query);
            res.send(user)
        })
        // end drink
        // review
        app.post('/reviews', async (req, res) => {
            const user = req.body;
            const result = await reviewCollection.insertOne(user);
            res.send(result)
        });
        app.get('/reviews', async (req, res) => {
            const query = {};
            const cursor = reviewCollection.find(query);
            const users = await cursor.toArray();
            res.send(users)
        })
        app.get('/review', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const result = await reviewCollection.find(query).toArray();
            res.send(result)
        });
        app.get('/reviews/:serviceId', async (req, res) => {
            const serviceId = req.params.serviceId;
            const query = { serviceId: serviceId };
            const result = await reviewCollection.find(query).toArray();
            res.send(result)
        })
        app.get('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await reviewCollection.findOne(query);
            res.send(result)
        })
        app.delete('/review/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await reviewCollection.deleteOne(query);
            res.send(result)
        })
        // end review
        // add Product

        // end add Product


        // sponsor 
        app.get('/sponsor', async (req, res) => {
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