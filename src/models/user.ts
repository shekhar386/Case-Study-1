/**
 * Model for Users
 */

import { Schema, model } from "mongoose";
import { generate } from "shortid";

export interface IUser {
    name: string, //user name
    email: string, //user email
    password: string, //user password
}

//Creating schema for user
const userSchema=new Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    }
})

//Exporting the model
export default model<IUser>("user",userSchema);
