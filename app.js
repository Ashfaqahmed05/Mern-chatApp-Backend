import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express from "express";
import { errorMiddleware } from "./middlewares/error.js";
import { connectDB } from "./utils/features.js";

import chatRoute from "./routes/chat.js";
import userRoute from "./routes/user.js";

dotenv.config({
    path: "./.env"
})
const port = process.env.PORT || 3000
const mongoURI = process.env.MONGO_URI
connectDB(mongoURI)

const app = express();

// using middlewares here 
app.use(express.json())
app.use(cookieParser())


app.use("/user" ,userRoute)
app.use("/chat" ,chatRoute)


app.get("/", (req, res)=>{
    res.send("Hello World")
})


app.use(errorMiddleware)

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})