const express = require("express")
const dotenv = require('dotenv');
const mongoose = require("mongoose");

dotenv.config();

const redis = require('redis');
const REDIS_URL = process.env.REDIS_URL


let redisClient;

(async () => {
  redisClient = redis.createClient(REDIS_URL);

  redisClient.on("error", (error) => console.error(`Error : ${error}`));

    redisClient.connect().then(() => {console.log("REDIS CONNECTED")}).catch((err) => console.log(err))
})();

const Entries = require("./models");

const app = express()

const PORT = process.env.PORT || 8080

const DB = process.env.DB_URL

app.use(express.json())


const connectDB = () => {
    mongoose.connect(DB, {
    })
    .then(() => {
        console.log("DATABASE CONNECTED")
    })
    .catch((err) => {
        console.log(err)
    })
}


app.use("/ping", (req, res) => {
    try{
        res.status(200).json({
            success: true,
            endpoint: "/ping",
            message: "pong"
        })
    }catch(err) {
        console.log(err)
        res.status(200).json({
            success:false,
        })
    }
})


const createEntries =async () => {
    for (i=1;i<=1000;i++) {
        await Entries.create({entryId: Math.floor(Math.random() * 100000)})
    }
}

app.use("/db",async(req, res) => {
    try{
    connectDB()

    const entries = await  Entries.find()

    if (entries.length == 0) {
     createEntries()
    }
    res.status(200).json({
        success: true,
        endpoint: "/db",
        data: {
            entries: entries,
            results: entries.length,
        },
    })
    }catch (err) {
        console.log(err)
        res.status(400).json({
            success: false,
            message: "Something went wrong"
        })
    }
})

const cache = async (key="key", value="value") => {
    redisClient.set(key, JSON.stringify(value))
};

app.use("/redis", async(req, res) => {
    try{
        const {key, value} = req.body
        cache(key, value)
        res.status(200).json({
            success: true,
            endpoint: "/redis",
            key: value,
        })
    }catch (err) {
        console.log(err)
        res.status(400).json({
            success: false,
            message: "Something went wrong"
        })
    }
})

app.use(function(req, res) {
          res.json({
            success: false,
            message: "Invalid request"
          });
    });
    

app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`)
})
