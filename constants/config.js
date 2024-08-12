
const corsOptions = {
    origin: [
        "http://localhost:5173",
        "http://localhost:5173",
        process.env.CLIENT_URL
    ],
    credentials: true
}

const USER_TOKEN = "user-token"

export { corsOptions, USER_TOKEN }