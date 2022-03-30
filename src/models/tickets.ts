/**
 * Model for Tickets
 */

import { Schema, model } from "mongoose";
import { IMovies } from "./movies";
import { IUser } from "./user";

export interface ITickets {
    numberOfTickets: number, //no. of tickets to be booked
    showTime: string; //time of the movie
    movie: string; //movie name
    mid: IMovies | string; //reference movie _id
    uid: IUser | string; //reference user _id

}

const ticketSchema = new Schema({
    numberOfTickets: {
        type: Number,
        required: true,
    },
    showTime: {
        type: String,
        required: true,
    },
    movie: {
        type: String,
        required: true,
    },
    mid: {
        type: Schema.Types.ObjectId,
        ref: "movies",
        required: true,
    },
    uid: {
        type: Schema.Types.ObjectId,
        ref: "user",
    },
});

//exporting the model
export default model<ITickets>("tickets", ticketSchema);
