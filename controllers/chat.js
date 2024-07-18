import { TryCatch } from "../middlewares/error.js"
import { ErrorHandler } from "../utils/utility.js";
import { Chat } from "../models/chat.js"
import { User } from "../models/user.js"
import { Message } from "../models/message.js"
import { deleteFilesFromClaudinary, emitEvent } from "../utils/features.js";
import { ALERT, NEW_ATTACHEMENTS, NEW_MESSAGE_ALERT, REFETCH_CHATS } from "../constants/events.js";
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

    const transformedChats = chats.map(({ _id, name, groupChat, members, lastMessage }) => {

        const otherMember = getOtherMember(members, req.user)

        return {
            _id,
            groupChat,
            avatar: groupChat ? members.slice(0, 3).map(({ avatar }) => avatar.url) : [otherMember.avatar.url],
            name: groupChat ? name : otherMember.name,
            members: members.reduce((prev, curr) => {
                if (curr._id.toString() !== req.user.toString()) {
                    prev.push(curr._id)
                }
                return prev
            }, []),

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

    const groups = chats.map(({ _id, members, groupChat, name }) => ({
        _id,
        groupChat,
        name,
        avatar: members.slice(0, 3).map(({ avatar }) => avatar.url)
    }))

    return res.status(200).json({
        success: true,
        groups,
    })
})

const addMembers = TryCatch(async (req, res, next) => {

    const { chatId, members } = req.body

    if (!members || members.length < 1) return next(new ErrorHandler("Please provide members", 400))

    const chat = await Chat.findById(chatId)

    if (!chat) return next(new ErrorHandler("Chat not found", 404))

    if (!chat.groupChat) return next(new ErrorHandler("This is not a group chat", 400))

    if (chat.creator.toString() !== req.user.toString())
        return next(new ErrorHandler("You are not allowed to add members", 403))

    const allNewMembersPromise = members.map((i) => User.findById(i, "name"))

    const allNewMembers = await Promise.all(allNewMembersPromise)

    const uniqueMembers = allNewMembers.filter((i) => !chat.members.includes(i._id.toString())).map((i) => i._id)


    chat.members.push(...uniqueMembers)

    if (chat.members.length > 100)
        return next(new ErrorHandler("You can't add more than 100 members", 400))

    await chat.save()

    const allUsersName = allNewMembers.map((i) => i.name).join(",")

    emitEvent(
        req, ALERT, chat.members, `${allUsersName} has been added to ${chat.name} group`
    )

    emitEvent(
        req, REFETCH_CHATS, chat.members
    )

    return res.status(200).json({
        success: true,
        message: "Members Added successfully",
    })
})

const removeMember = TryCatch(async (req, res, next) => {

    const { userId, chatId } = req.body

    const [chat, userThatWillBeRemoved] = await Promise.all([
        Chat.findById(chatId),
        User.findById(userId, "name")
    ])

    if (!chat) return next(new ErrorHandler("Chat not found", 404))

    if (!chat.groupChat) return next(new ErrorHandler("This is not a group chat", 400))

    if (chat.creator.toString() !== req.user.toString())
        return next(new ErrorHandler("You are not allowed to add members", 403))

    if (chat.members.length <= 3) return next(new ErrorHandler("Group must have 3 members", 400))

    chat.members = chat.members.filter((member) => member.toString() !== userId.toString())

    await chat.save()

    emitEvent(req, ALERT, chat.members, `${userThatWillBeRemoved.name} has been removed from the group`)

    emitEvent(req, REFETCH_CHATS, chat.members)

    return res.status(200).json({
        success: true,
        message: "Member removed successfully"
    })

})


const leaveGroup = TryCatch(async (req, res, next) => {
    const chatId = req.params.id;

    const chat = await Chat.findById(chatId);

    if (!chat) return next(new ErrorHandler("Chat not found", 404));
    if (!chat.groupChat) return next(new ErrorHandler("This is not a group chat", 400));

    const remainingMembers = chat.members.filter((member) => member.toString() !== req.user.toString());

    if (remainingMembers.length < 3) return next(new ErrorHandler("Group must have at least 3 members", 400));

    if (chat.creator.toString() === req.user.toString()) {
        const newCreator = remainingMembers[0];
        chat.creator = newCreator;
    }

    chat.members = remainingMembers;

    const user = await User.findById(req.user, "name"); // Ensure User model is used here

    await chat.save();

    emitEvent(req, ALERT, chat.members, `User ${user.name} has left the group`);

    return res.status(200).json({
        success: true,
        message: "Member removed successfully"
    });
});


const sendAttachements = TryCatch(async (req, res, next) => {

    const { chatId } = req.body;

    const [chat, me] = await Promise.all([Chat.findById(chatId),
    User.findById(req.user, "name")]);

    if (!chat) return next(new ErrorHandler("Chat not found", 404))

    const files = req.files || [];

    if (files.length < 1) return next(new ErrorHandler("Please provide attachements", 400))

    const attachements = ["lol", "lol", "lol", "lol", "lol", "lol", "lol",]

    const messageForDB = { content: "", attachements, sender: me._id, chat: chatId }

    const messageForRealTime = {
        ...messageForDB,
        sender: {
            _id: me._id,
            name: me.name,
        },
    }

    const message = await Message.create(messageForDB)


    emitEvent(req, NEW_ATTACHEMENTS, chat.members, {
        message: messageForRealTime,
        chatId,
    })

    emitEvent(req, NEW_MESSAGE_ALERT, chat.members, { chatId })

    return res.status(200).json({
        success: true,
        message: message
    })
})


const getChatDetails = TryCatch(async (req, res, next) => {

    if (req.query.populate === "true") {
        
        const chat = await Chat.findById(req.params.id).populate("members", "name avatar").lean()

        if (!Chat) return next(new ErrorHandler("Chat not found", 404))

        console.log(chat.members);

        chat.members = chat.members.map(({ _id, name, avatar }) => ({
            _id,
            name,
            avatar: avatar.url, 
        }));

        return res.status(200).json({
            success: true,
            chat,
        })

    } else{
        const chat = await Chat.findById(req.params.id)
        console.log("not populate");

        if(!chat) return next(new ErrorHandler("chat not found", 404))

        return res.status(200).json({
            success: true,
            chat,
        })
    }
})

const renameGroup = TryCatch(async (req, res, next) => {
    const chatId = req.params.id;
    const { name } = req.body;

    const chat = await Chat.findById(chatId);

    if(!chat) return next(new ErrorHandler("Chat not found", 404))

    if(!chat.groupChat) return next(new ErrorHandler("This is not a group chat", 404))

    if( chat.creator.toString() !== req.user.toString())
    return next(new ErrorHandler("You are not allow to rename this group", 403))

    chat.name = name

    await chat.save()

    emitEvent(req, REFETCH_CHATS, chat.members)

    return res.status(200).json({
        success: true,
        message: "Group name changed successfully"
    })

})

const deleteChat = TryCatch(async (req, res, next) => {

    const chatId = req.params.id;

    const chat = await Chat.findById(chatId);

    if(!chat) return next(new ErrorHandler("Chat not found", 404))

    const members = chat.members;  

    if(chat.groupChat && chat.creator.toString() !== req.user.toString())
    return next(new ErrorHandler("You are not allow to delete this group", 403))

    if(!chat.groupChat && !chat.members.includes(req.user.toString())){
        return next(new ErrorHandler("You are not allow to delete this chat", 403))
    }

    const messagesWithAttachements = await Message.find({
        chat: chatId,
        attachements: {$exists: true, $ne: [] },
    })

    const public_ids = []

    messagesWithAttachements.forEach(({ attachements }) => {
        attachements.forEach(({public_id}) => {
            public_ids.push(public_id)
        })
    })

    await Promise.all([
        deleteFilesFromClaudinary(public_ids), chat.deleteOne(),
        Message.deleteMany({ chat: chatId })
    ])

    emitEvent(req, REFETCH_CHATS, members);

    return res.status(200).json({
        success: true,
        message: "Chat deleted successfully"
    })

})
export { 
    newGroupChat, 
    getMyChats, 
    getMyGroups, 
    addMembers, 
    removeMember, 
    leaveGroup, 
    sendAttachements, 
    getChatDetails, 
    renameGroup,
    deleteChat }
