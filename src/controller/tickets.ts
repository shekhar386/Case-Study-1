import mongoose from "mongoose";
import movies from "../models/movies";
import moment from "moment";
import tickets from "../models/tickets";

/**
 * Controller for tickets
 */

export default class CtrlTickets {
    /**
     * Create a job application
     * by the job seeker
     * @param body
     */
    static async create(body: any, userId: string): Promise<any> {
        //variable to store no. of tickets
        const ticketCount = parseInt(body.numberOfTickets.valueOf());
        //validate if movie has seats
        const validate = await movies.find(
            {$and:[
                    {_id: body.mid},
                    {seatsAvailable: { $gte: ticketCount}}
                ]

            })
        //if sufficient seats available
        if(validate.length > 0) {
            const data = {
                ...body,
                showTime: moment(body.showTime).utcOffset(0, true).format(),
                //@ts-ignore
                //adding session user's _id'
                uid: new mongoose.Types.ObjectId(userId)
            }
            //ticket creation
            await tickets.create(data);
            //updating seatsAvailable in movies
            await movies.findOneAndUpdate({_id: body.mid},
                {$inc: {seatsAvailable: -ticketCount},}
            )
            //show result
            return data
        }
        //if no seats are left
        else{
            throw new Error("No seats left")
        }
    }
}