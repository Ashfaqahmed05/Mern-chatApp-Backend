import { TryCatch } from "../middlewares/error.js"
import { ErrorHandler } from "../utils/utility.js";
import { Chat } from "../models/chat.js"
import { emitEvent } from "../utils/features.js";
import { ALERT, REFETCH_CHATS } from "../constants/events.js";
import { getOtherMember } from "../lib/helper.js";


const newGroupChat = TryCatch(async (req, res, next) => {
    const { name, members } = req.body;

    if (members.length < 2)
        return next(
            new ErrorHandler("Group must have at least 3 members", 400)
        )

        const allMembers = [...members, req.user];        
        console.log(allMembers);

    await Chat.create({
        name,
        groupChat: true,
        creator: req.user,
        members: allMembers,
    })

    emitEvent(req, ALERT, allMembers, `Welcome to ${name} group`);
    emitEvent(req, REFETCH_CHATS, members);

    return res.status(201).json({
        success: true,
        message: "Group created"
    })

})

const getMyChats = TryCatch(async (req, res, next) => {
    
   const chats = await Chat.find({ members: req.user }).populate(
    "members",
    "name avatar"
   )

   const transformedChats = chats.map(({_id, name, groupChat, members, lastMessage}) => {

    const otherMember = getOtherMember(members, req.user)

    return{
         _id,
        groupChat,
        avatar:groupChat?members.slice(0, 3).map(({avatar})=> avatar.url): [otherMember.avatar.url],
        name: groupChat? name : otherMember.name,
        members: members.reduce((prev, curr)=> {
            if(curr._id.toString() !== req.user.toString()){
                prev.push(curr._id)
            }
            return prev
        },[]),
        
    }
   })

    return res.status(200).json({
        success: true,
        transformedChats
    })

})

const getMyGroups = TryCatch(async (req, res, next) => {

    const chats = await Chat.find({ members: req.user }).populate(
        "members",
        "name avatar"
       )

       const groups = chats.map(({ _id, members, groupChat, name})=>({
        _id, 
        groupChat, 
        name, 
        avatar:members.slice(0, 3).map(({ avatar }) => avatar.url)
       }))

       return res.status(200).json({
        success: true,
        groups,
       })
})


export { newGroupChat, getMyChats, getMyGroups }
