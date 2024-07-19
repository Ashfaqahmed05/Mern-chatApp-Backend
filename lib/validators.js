import { body, validationResult, check, param } from "express-validator"
import { ErrorHandler } from "../utils/utility.js"

const loginValidator = () => [
    body("username", "Please Enter Username").notEmpty(),
    body("password", "Please Enter Password").notEmpty(),

]

const registerValidator = () => [
    body("name", "Please Enter Name").notEmpty(),
    body("username", "Please Enter Username").notEmpty(),
    body("password", "Please Enter Password").notEmpty(),
    body("bio", "Please Enter Bio").notEmpty(),
    check("avatar", "Please Upload Avatar").notEmpty()

]

const newGroupValidator = () => [
    body("name", "Please Enter Name").notEmpty(),
    body("members").notEmpty().withMessage("Please Enter Members").isArray({ min: 2, max: 100 }).withMessage("Members must be 2-100"),
]
const addMembersValidator = () => [
    body("chatId", "Please Enter Chat ID").notEmpty(),
    body("members").notEmpty().withMessage("Please Enter Members").isArray({ min: 1, max: 97 }).withMessage("Members must be 1-97"),
]

const removeMemberValidator = () => [
    body("chatId", "Please Enter Chat ID").notEmpty(),
    body("userId", "Please Enter User ID").notEmpty(),

]


const sendAttachementsValidator = () => [
    body("chatId", "Please Enter Chat ID").notEmpty(),
    check("avatar").notEmpty().withMessage("Please Upload Avatar")
        .isArray({ min: 1, max: 5 }).withMessage("Members must be 1-5"),
]

const chatIdValidator = () => [
    param("id", "Please Enter Chat ID").notEmpty(),

]

const renameGroupValidator = () => [
    param("id", "Please Enter Chat ID").notEmpty(),
    body("name", "Please Enter New Name").notEmpty(),
]

const sendRequestValidator = () => [
    body("userId", "Please Enter User ID").notEmpty(),
]

const acceptRequestValidator = () => [
    body("requestId", "Please Enter Requesst ID").notEmpty(),
    body("accept").notEmpty().withMessage("Please Add Accept")
        .isBoolean().withMessage("Accept must be a boolean"),

]

const validateHandler = (req, res, next) => {
    const errors = validationResult(req)

    const errorMessages = errors.array().map((error) => error.msg).join(",")


    if (errors.isEmpty()) return next()
    else next(new ErrorHandler(errorMessages, 400))
}

export {
    registerValidator,
    validateHandler,
    loginValidator,
    newGroupValidator,
    addMembersValidator,
    removeMemberValidator,
    sendAttachementsValidator,
    chatIdValidator,
    renameGroupValidator,
    sendRequestValidator,
    acceptRequestValidator
}