import dotenv from "dotenv";

dotenv.config();

export const ENV_VARS = {
    PORT: process.env.PORT,
    MONGO_URI: process.env.MONGO_KEY,
    MONGO_URI_TEST: process.env.MONGO_KEY_TEST,
    NODE_ENV: process.env.NODE_ENV,
    JWT_SECRET: process.env.JWT_SECRET,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    REDIS_CLOUD_NAME: process.env.REDIS_CLOUD_NAME,
    REDIS_CLOUD_PASSWORD: process.env.REDIS_CLOUD_PASSWORD,
    REDIS_PORT: process.env.REDIS_PORT,
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_USERNAME: process.env.REDIS_USERNAME,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    API_ROUTE: process.env.API_ROUTE || "localhost:3001",
}