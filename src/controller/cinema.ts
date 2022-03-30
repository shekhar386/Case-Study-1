/**
 * Controller for cinema
 */

import cinema, {ICinema} from "../models/cinema";

export default class CtrlCinema {

    /**
     * Creating a new cinema
     * @param body
     */
    static async create(body: any): Promise<ICinema> {
        //create cinema
        return cinema.create(body);
    }

    /**
     * Find all cinema
     * for all
     * @param page
     * @param limit
     * @param  ord
     * @param orderBy
     */
    static async findAll(page: number, limit: number, ord: string, orderBy: string ): Promise<ICinema[]> {
        // variable for sorting order
        const order = (ord == "asc") ? 1 : -1;
        //sort according to showTime
        if (orderBy === "showTime") {
            return cinema.aggregate([
                //paging and limit per page
                {
                    $skip: page * limit,
                },
                {
                    $limit: limit,
                },
                //join movies collection
                {
                    $lookup: {
                        from: "movies",
                        localField: "_id",
                        foreignField: "cid",
                        as: "Movie",
                        pipeline: [
                            {
                                //sorting
                                $sort: {
                                    showTime: order,
                                }
                            }
                        ]
                    }
                }
            ]).exec();
        }
        //sort by name
        else {
            return cinema.aggregate([
                //paging and limit per page
                {
                    $skip: page * limit,
                },
                {
                    $limit: limit,
                },
                //join movies collection
                {
                    $lookup: {
                        from: "movies",
                        localField: "_id",
                        foreignField: "cid",
                        as: "Movie",
                        pipeline: [
                            {
                                //sorting
                                $sort: {
                                    name: order,
                                }
                            }
                        ]
                    }
                }
            ]).exec();
        }
    }

    /**
     * Find certain cinema
     * for all
     * @param page
     * @param limit
     * @param cinemaName
     */
    static async findCert(page: number, limit: number, cinemaName: string ): Promise<ICinema[]> {
        return cinema.aggregate([
            {
                $match: {
                    //get cinema according to domain name taken as input
                    name: cinemaName,
                },
            },
            //paging and limit per page
            {
                $skip: page * limit,
            },
            {
                $limit: limit,
            },
            //joining movies collection
            {
                //find movies details
                $lookup: {
                    from: "movies",
                    localField: "_id",
                    foreignField: "cid",
                    as: "Movie",
                },
            }
        ]).exec();
    }
}