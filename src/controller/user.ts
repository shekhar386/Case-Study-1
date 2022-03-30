/**
 * Controller for user
 */

import Bcrypt from "../services/bcrypt";
import user, {IUser} from "../models/user";
import mongoose from "mongoose";
import tickets from "../models/tickets";
import moment from "moment";

export default class CtrlUser {
    /**
     * Create new user
     * @param body
     */
    static async create(body: any): Promise<IUser> {
        //hashing the password
        const hash = await Bcrypt.hashing(body.password);
        //replacing password with hashed password
        const data = {
            ...body,
            password: hash,
        };
        //create jobSeeker
        return user.create(data);
    }

    /**
     * Authorize user
     * @param email
     * @param password
     */
    static async auth(email: string, password: string): Promise<IUser> {
        // fetch user from database
        const userData = await user.findOne({ email }).lean();
        // if users exists or not
        if (userData) {
            // verify the password
            const result = await Bcrypt.comparing(password, userData.password);
            // if password is correct or not
            // if correct, return the user
            if (result){
                return userData;
            }
            // throw error
            else{
                throw new Error("password doesn't match");
            }
        }
        // throw error
        else{
            throw new Error("user doesn't exists");
        }
    }

    /**
     * Return the user's tickets (profile)
     * @param userData
     */
    static async profile(userData: string): Promise<IUser[]> {
        //return all tickets which are not expired
        return user.aggregate([
            {
                $match: {
                    //matching _id from collection with session user's _id
                    //@ts-ignore
                    _id: new mongoose.Types.ObjectId(userData),
                }
            },
            {
                //joining tickets collection
                $lookup: {
                    from: "tickets",
                    localField: "_id",
                    foreignField: "uid",
                    as: "Tickets",
                    pipeline: [
                        {
                            $match: {
                                showTime: {$lt: moment().utcOffset(0, true).toISOString()}
                            }
                        }
                    ]
                }
            }
        ]);
    }
}

