/**
 * Model for movies
 */

import { Schema, model } from "mongoose";
import { ICinema } from "./cinema";

export interface IMovies {
    name: string; //movie name
    showTime: string; //time of the show
    seatsAvailable: number; //no. of seats available for the show
    cid: ICinema | string; //reference to cinema
}
const schema = new Schema({
    name: {
        type: String,
        required: true,
    },
    showTime:{
        type: String,
        required: true
    },
    seatsAvailable: {
        type: Number,
        required: true
    },
    cid: {
        type: Schema.Types.ObjectId,
        ref: "cinema",
    }
});

//exporting the model
export default model<IMovies>("movies", schema);
