import { v2 as cloudinary } from 'cloudinary';
import { Clodinary_Cloud_Name, Clodinary_API_Key, Clodinary_API_Secret } from '../utils/env.utils.js';

cloudinary.config({
    cloud_name: Clodinary_Cloud_Name,
    api_key: Clodinary_API_Key,
    api_secret: Clodinary_API_Secret,
});

export default cloudinary;