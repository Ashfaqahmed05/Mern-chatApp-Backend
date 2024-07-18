import { faker, simpleFaker } from "@faker-js/faker"
import { User } from "../models/user.js";
import { Chat } from "../models/chat.js";
import { Message } from "../models/message.js";


const creatUser = async (numUsers) => {
    try {

        const usersPromise = [];

        for (let i = 0; i < numUsers; i++) {
            const tempUser = User.create({
                name: faker.person.fullName(),
                username: faker.internet.userName(),
                bio: faker.lorem.sentence(10),
                password: "password",
                avatar: {
                    url: faker.image.avatar(),
                    public_id: faker.system.fileName()
                }
            })

            usersPromise.push(tempUser)
        }

        await Promise.all(usersPromise)

        console.log("Users created", numUsers);
        process.exit(1)

    } catch (error) {
        console.log(error);
        process.exit(1)

    }
}


const createSingleChats = async (numOfChat) => {
    try {
        const user = await User.find().select("_id")

        const chatPromise = [];

        for (let i = 0; i < user.length; i++) {
            for (let j = i + 1; j < user.length; j++) {
                chatPromise.push(
                    Chat.create({
                        name: faker.lorem.words(2),
                        members: [user[i], user[j]],
                    })
                )
            }

        }
        await Promise.all(chatPromise)
        console.log("Chats created", numOfChat);
        process.exit()

    } catch (error) {
        console.log(error);
        process.exit()
    }
}

const createGroupChat = async (numofChat) => {
    try {
        const user = await User.find().select("_id")

        const chatPromise = [];

        for (let i = 0; i < numofChat; i++) {
            const numMembers = simpleFaker.number.int({ min: 3, max: user.lenght })

            const members = [];

            for (let i = 0; i < numMembers; i++) {

                const randomIndex = Math.floor(Math.random() * user.lenght)

                const randomUser = user[randomIndex]

                if (members.includes(randomUser)) {
                    members.push(randomUser)
                }
            }

            const chat = Chat.create({
                groupChat: true,
                name: faker.lorem.words(1),
                members,
                creator: members[0],
            })
            chatPromise.push(chat)
        }
        await Promise.all(chatPromise)

        console.log('chat created successfully');
        process.exit()

    } catch (error) {
        console.log(error);
        process.exit()
    }
}

const createMessages = async (numofChat) => {
    try {
        const user = await User.find().select("_id")
        const chat = await Chat.find().select("_id")

        const MessagePromise = []

        for (let i = 0; i < numofChat; i++) {
            const randomUser = user[Math.floor(Math.random() * user.lenght)]
            const randomChat = chat[Math.floor(Math.random() * chat.lenght)]

            MessagePromise.push(
                Message.create({
                    chat: randomChat,
                    sender: randomUser,
                    content: faker.lorem.sentence()
                })
            )
        }

        await Promise.all(MessagePromise)

        console.log("messages created successfully");
        process.exit()
    } catch (error) {
        console.log(error);
        process.exit(1)
    }

}

const createMessagesInChat = async (chatId, numofMessages) => {
    try {
        const users = await User.find().select("_id");
        
        const MessagePromises = [];

        for (let i = 0; i < numofMessages; i++) {
            const randomUser = users[Math.floor(Math.random() * users.length)];

            MessagePromises.push(
                Message.create({
                    chat: chatId,
                    sender: randomUser._id, // Make sure to use the _id field
                    content: faker.lorem.sentence()
                })
            );
        }

        await Promise.all(MessagePromises);

        console.log("Messages created successfully");
        process.exit();
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};



export { creatUser, createSingleChats, createGroupChat, createMessages, createMessagesInChat }