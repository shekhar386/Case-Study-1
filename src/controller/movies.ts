/**
 * Controller for job
 */

import moment from "moment";
import mongoose from "mongoose";
import movies, {IMovies} from "../models/movies";

export default class CtrlMovies {

    /**
     * Create new movie
     * @param body
     */
    static async create(body: any): Promise<any> {
        const data = await movies.find(
            {$and:[
                    {showTime: body.showTime},
                    {cid: new mongoose.Types.ObjectId(body.cid)},
                ]
            })
        //create movie
        if(data.length > 0) {
            throw new Error("Cinema already booked for this particular showtime");
        }
        else {
            const data = {
                ...body,
                //converting from string to date
                showTime: moment(body.showTime).utcOffset(0, true).toISOString()
            }
            //create movie
            await movies.create(data);
            //show created movie
            return data;
        }
    }

    /**
     * Find all movies
     * for all
     * @param page
     * @param limit
     * @param ord
     * @param orderBy
     */
    static async findAll(page: number, limit: number, ord: string, orderBy: string ): Promise<IMovies[]> {
        //variable for sorting order
        const order = (ord == "asc") ? 1 : -1;
        //sort by ctc
        if (orderBy === "name") {
            return movies.aggregate([
                //paging and limit per page
                {
                    $skip: page * limit,
                },
                {
                    $limit: limit,
                },
                //cinema details of the movie
                {
                    $lookup: {
                        from: "cinemas",
                        localField: "cid",
                        foreignField: "_id",
                        as: "Cinema"
                    }
                },
                //sorting
                {
                    $sort: {
                        name: order,
                    }
                },
            ]).exec();
        }
        //sort by date
        else if (orderBy === "showTime") {
            return movies.aggregate([
                //paging and limit per page
                {
                    $skip: page * limit,
                },
                {
                    $limit: limit,
                },
                //cinema details of the movie
                {
                    $lookup: {
                        from: "cinemas",
                        localField: "cid",
                        foreignField: "_id",
                        as: "Cinema"
                    }
                },
                //sorting
                {
                    $sort: {
                        showTime: order,
                    }
                }
            ]).exec();
        }
    }

    /**
     * Find certain job postings
     * for job seeker
     * @param page
     * @param limit
     * @param filterBy
     * @param filter
     */
    static async findCert(page: number, limit: number, filterBy: string, filter: string ): Promise<IMovies[]> {
       //filter by showTime
        if(filterBy === "showTime") {
            return movies.aggregate([
                {
                    $match: {
                        //should be added within 7 days
                        showTime: filter,
                    },
                },
                //paging and limit per page
                {
                    $skip: page * limit,
                },
                {
                    $limit: limit,
                },
                {
                    //cinema details
                    $lookup: {
                        from: "cinemas",
                        localField: "cid",
                        foreignField: "_id",
                        as: "Cinema"
                    }
                },
            ]).exec();
        }
        else{
            return movies.aggregate([
                {
                    $match: {
                        //should be added within 7 days
                        name: filter,
                    },
                },
                //paging and limit per page
                {
                    $skip: page * limit,
                },
                {
                    $limit: limit,
                },
                {
                    //cinema details
                    $lookup: {
                        from: "cinemas",
                        localField: "cid",
                        foreignField: "_id",
                        as: "Cinema"
                    }
                },
            ]).exec();
        }
    }
}