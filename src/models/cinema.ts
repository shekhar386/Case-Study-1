/**
 * Model for Cinemas
 */


import { Schema, model } from "mongoose";

export interface ICinema {
    name: string; //cinema name
    location: string; //location of the cinema
}
const schema = new Schema({
    name: {
        type: String,
        required: true,
    },
    location:{
        type: String,
        required: true
    },

});

//exporting the model
export default model<ICinema>("cinema", schema);
