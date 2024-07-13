import { compare } from "bcrypt";
import {User} from "../models/user.js"
import { cookieOption, sendToken } from "../utils/features.js"
import { ErrorHandler } from "../utils/utility.js";
import { TryCatch } from "../middlewares/error.js";

// Create a new user and save it to database and save token in cookie

const newUser = async (req, res) => {
    const { name, username, password, bio } = req.body;
    console.log(req.body);

    try {
        const avatar = {
            public_id: "jdhskjvdnk",
            url: "dnsvkdn"
        };

        const user = await User.create({
            name,
            bio,
            username,
            password,
            avatar,
        });

        if (!user) {
            return res.status(500).json({ success: false, message: "User creation failed" });
        }

        sendToken({ res, user, code: 201, message: "User created successfully" });
    } catch (error) {
        console.error("Error creating user:", error);
        return res.status(500).json({ success: false, message: "User creation failed" });
    }
};


const login = TryCatch(async (req, res, next) =>{
    
        const {username, password} = req.body;

        const user = await User.findOne({username}).select("+password")
        if(!user) return next(new ErrorHandler("Invalid Username or Password", 404))
    
        const isMatch = await compare(password, user.password)
    
        if(!isMatch) return next(new ErrorHandler("Invalid Username or Password", 404))
    
        sendToken({res, user, code: 200, message: `Welcome Back, ${user.name}`})
    
    
})

const getMyProfile = TryCatch(async (req, res) => {
    const user = await User.findById(req.user)

    res.status(200).json({ success: true, data: user });
})


const logout = TryCatch(async (req, res)=> {
    return res.status(200).cookie("user-token", "", {...cookieOption, maxAge: 0}).json({
        success: true,
        message: "logged out successfully",
    })
})


const searchUser = TryCatch(async (req, res)=> {

    const {name} = req.query;


    return res.status(200).json({
        success: true,
        message: name,
    })
})


export {login, newUser, getMyProfile, searchUser, logout}