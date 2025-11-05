import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type:String,
        required:true,
        default:"showroom"
    },
    acivity :{
        type:String,
        default:""
    },
}, { timestamps: true });

export const Admin = mongoose.model("AdminModels", adminSchema); 
