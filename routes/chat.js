import express from "express"
import { isAuthenticated } from "../middlewares/auth.js"
import { renameGroup, addMembers, getChatDetails, getMyChats, getMyGroups, leaveGroup, newGroupChat, removeMember, sendAttachements, deleteChat, getMessages } from "../controllers/chat.js"
import { attachmentsMulter } from "../middlewares/multer.js"
import { addMembersValidator, chatIdValidator,  newGroupValidator, removeMemberValidator, renameGroupValidator, sendAttachementsValidator, validateHandler } from "../lib/validators.js"

const app = express.Router()

app.get("/message/:id", chatIdValidator(), validateHandler, getMessages)

app.use(isAuthenticated)


app.post("/new", newGroupValidator(), validateHandler, newGroupChat)

app.get("/my", getMyChats)

app.get("/my/groups", getMyGroups)

app.put("/addMembers", addMembersValidator(), validateHandler, addMembers)

app.put("/removeMembers", removeMemberValidator(), validateHandler, removeMember)

app.delete("/leave/:id", chatIdValidator(), validateHandler, leaveGroup)

app.post("/message", attachmentsMulter, sendAttachementsValidator(), validateHandler, sendAttachements)


app.route("/:id")
.get(chatIdValidator(), validateHandler, getChatDetails)
.put(renameGroupValidator(), validateHandler, renameGroup)
.delete(chatIdValidator(), validateHandler, deleteChat)

export default app