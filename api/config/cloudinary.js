import { ENV_VARS } from "./envVars.js";
import cloudinary from 'cloudinary';

cloudinary.config({
    cloud_name: ENV_VARS.CLOUDINARY_CLOUD_NAME, 
    api_key: ENV_VARS.CLOUDINARY_API_KEY,
    api_secret: ENV_VARS.CLOUDINARY_API_SECRET,
});

export default cloudinary.v2;