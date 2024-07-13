import mongoose from "mongoose";
import jwt from "jsonwebtoken"

const cookieOption = {
    maxAge: 15 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: true,
    sameSite: "none",
}

const connectDB = (uri) => {
    mongoose.connect(uri, { dbName: "ChatApp" })
        .then((data) => console.log(`Connected to DB: ${data.connection.host}`))
        .catch((err) => {
            throw err;
        })
}


const sendToken = ({ res, user, code, message }) => {

    const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET);



    return res.status(code).cookie("user-token", token,  cookieOption).json({
        success: true,
        message,
    })


}

const emitEvent = (req, event, users, data) => {
    console.log("Emmiting event" , event);
}


export { connectDB, sendToken, cookieOption, emitEvent }