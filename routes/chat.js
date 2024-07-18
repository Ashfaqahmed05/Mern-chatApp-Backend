import express from "express"
import { isAuthenticated } from "../middlewares/auth.js"
import { renameGroup, addMembers, getChatDetails, getMyChats, getMyGroups, leaveGroup, newGroupChat, removeMember, sendAttachements, deleteChat, getMessages } from "../controllers/chat.js"
import { attachmentsMulter } from "../middlewares/multer.js"

const app = express.Router()


app.use(isAuthenticated)

app.post("/new", newGroupChat)

app.get("/my", getMyChats)

app.get("/my/groups", getMyGroups)

app.put("/addMembers", addMembers)

app.put("/removeMembers", removeMember)

app.delete("/leave/:id", leaveGroup)

app.post("/message", attachmentsMulter, sendAttachements)

app.get("/message/:id", getMessages)

app.route("/:id").get(getChatDetails).put(renameGroup).delete(deleteChat)

export default app