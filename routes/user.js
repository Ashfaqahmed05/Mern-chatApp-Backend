import express from "express"
import { getMyProfile, login, logout, newUser, searchUser, sendFriendRequest, acceptFriendRequest, getMyAllNotifications, getMyFriends } from "../controllers/user.js"
import { acceptRequestValidator, loginValidator, registerValidator, sendRequestValidator, validateHandler } from "../lib/validators.js"
import { isAuthenticated } from "../middlewares/auth.js"
import { singleAvatar } from "../middlewares/multer.js"

const app = express.Router()


app.post("/new", singleAvatar, registerValidator(), validateHandler, newUser)
app.post("/login", loginValidator(), validateHandler, login)

app.use(isAuthenticated)

app.get("/profile",  getMyProfile)

app.get("/logout", logout)

app.get("/search", searchUser)

app.put("/sendRequest", sendRequestValidator(), validateHandler, sendFriendRequest)

app.put("/acceptRequest", acceptRequestValidator(), validateHandler, acceptFriendRequest)

app.get("/notifications", getMyAllNotifications)
 
app.get("/friends", getMyFriends)



export default app