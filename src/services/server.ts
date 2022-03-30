/**
 * Main file with all the app services
 */

import express, { Request } from "express";
import bodyParser from "body-parser";
import Joi from "joi";
import session from "express-session";
import MongoStore from "connect-mongo";
import expressResponse from "../middleware/expressResponse";
import CtrlUser from "../controller/user";
import CtrlMovies from "../controller/movies";
import CtrlCinema from "../controller/cinema";
import CtrlTickets from "../controller/tickets";
import CtrlAdmin from "../controller/admin";

/**
 * Main server class
 */
export default class Server {

    //calling the express to app variable
    app = express();

    //function to start services
    async start() {
        console.log("Starting services")
        //Listening to port no. in .env file
        this.app.listen(process.env.PORT);
        console.log(`Express server started at http://localhost:${process.env.PORT}`)
        //calling middleware
        this.middleware();
        //calling routes
        this.routes();
    }

    /**
     * Middleware
     */
    middleware() {
        //for parsing the URL-encoded data
        this.app.use(bodyParser.urlencoded({extended: false}));
        //initializing the session
        this.app.use(
            session({
                secret: process.env.SESSION_SECRET,
                resave: false,
                saveUninitialized: false,
                store: MongoStore.create({
                    mongoUrl: process.env.SESSION_MONGO_URL,
                }),
                cookie: {
                    maxAge: 7 * 24 * 60 * 60 * 1000,
                },
            }),
        );
    }

    /**
     * App routes for cinema
     */
    routes() {

        /**
         * Create a user
         */
        this.app.post("/user/create",expressResponse(async (req:Request) => {
            //creating joi schema
            const schema=Joi.object({
                name:Joi.string().required(),//user's name
                email:Joi.string().email().required(),//user email id
                password:Joi.string().required(),//user password
            })
            //validate the schema
            await schema.validateAsync(req.body);
            //set session for the user
            //@ts-ignore
            req.session.user = req.body;
            //call and return controller
            //@ts-ignore
            return CtrlUser.create(req.session.user);
        }));

        /**
         * Authenticate a user
         */
        this.app.post("/user/auth", expressResponse(async (req: Request) => {
            //joi schema
            const schema = Joi.object({
                email: Joi.string().email().required(), //email of user
                password: Joi.string().required(), //password for user
            });
            //validate joi schema
            await schema.validateAsync(req.body);
            //calling controller
            //setting session for user
            //@ts-ignore
            req.session.user = await CtrlUser.auth(req.body.email, req.body.password);
            //show success
            return "Login Success!";
        }));

        /**
         * User's profile
         * only by user
         */
        this.app.get("/user/me", expressResponse(async (req: Request) => {
            //variable to store current job seeker's id
            //@ts-ignore
            const userData = req.session.user._id;
            //return and call controller
            return CtrlUser.profile(userData);
        }));

        /**
         * Authenticate the admin
         */
        this.app.post("/admin/auth", expressResponse(async (req: Request) => {
            //joi schema
            const schema = Joi.object({
                email: Joi.string().email().required(), //email id of admin
                password: Joi.string().required(), //password of admin
            });
            //validate schema
            await schema.validateAsync(req.body);
            //call controller
            //setting session for admin
            //@ts-ignore
            req.session.admin = await CtrlAdmin.auth(req.body.email, req.body.password);
            //show success
            return "Admin Login successful";
        }));

        /**
         * Logout
         * for all
         */
        this.app.post("/logout",expressResponse(async (req: Request) => {
            // destroy session
            await req.session.destroy(() => {});
            // return success to user
            return "Logged out";
        }));

        /**
         * Create a cinema
         * only be done by administrator
         */
        this.app.post("/cinema/create", expressResponse(async (req: Request) => {
            //authenticating the admin
            //@ts-ignore
            if(!(req.session && req.session.admin)){
                throw new Error("Not Authenticated")
            }
            //joi schema
            const schema = Joi.object({
                name: Joi.string().required(), //name of organisation
                location: Joi.string().required(),//input cinema location as body
            });
            //validate the schema
            await schema.validateAsync(req.body);
            //set session for organisation
            //@ts-ignore
            req.session.cinema = req.body;
            //call and return controller
            //@ts-ignore
            return CtrlCinema.create(req.session.cinema);
        }));

        /**
         * Create a movie
         * can only be done by administrator
         */
        this.app.post("/movies/create", expressResponse(async (req: Request) => {
            //authenticating the organisation
            //@ts-ignore
            if(!(req.session && req.session.admin)){
                throw new Error("Not Authenticated")
            }
            //joi schema for creating a movie
            const schema = Joi.object({
                name: Joi.string().required(),//input movie name as body
                showTime: Joi.string().required(),//input show timings as body
                seatsAvailable: Joi.number().required(),//input no. of seats available as body
                cid: Joi.any().required(),//input cinema _id as body
            });
            //validate joi schema
            await schema.validateAsync(req.body);
            //call and return controller
            //@ts-ignore
            return CtrlMovies.create(req.body);
        }));

        /**
         * Find all movies
         * for anyone
         */
        this.app.get("/movies/all", expressResponse(async (req: Request) => {
            //schema for page and limit
            const schema = Joi.object({
                page: Joi.number().integer().default(0),//input page no. as query
                limit: Joi.number().integer().default(5),//input limit per page as query
                order: Joi.string().default("asc"), //order of sorting (asc for ascending and dsc for descending)
                orderBy: Joi.string().default("showTime"), //what to sort the list by (name/showTime)
            });
            // validate joi schema
            const data = await schema.validateAsync(req.query);
            // call and return controller
            // @ts-ignore
            return CtrlMovies.findAll(data.page, data.limit, data.order, data.orderBy);
            }),
        );

        /**
         * Find certain movies
         * for anyone
         */
        this.app.get("/movies/certain", expressResponse(async (req: Request) => {
            //JOI schema
            const schema = Joi.object({
                page: Joi.number().integer().default(0),//input page no. as query
                limit: Joi.number().integer().default(5),//input limit per page as query
                filterBy: Joi.string().default("name"),//input what to filter by(name or showTime) as query
                filter: Joi.string() //filter constraint
            });
            // validate joi schema
            const data = await schema.validateAsync(req.query);
            // call and return controller
            // @ts-ignore
            return CtrlMovies.findCert(data.page, data.limit, data.filterBy, data.filter);
            }),
        );

        /**
         * Find all cinema
         * for anyone
         */
        this.app.get("/cinema/all", expressResponse(async (req: Request) => {
            //schema for page and limit
            const schema = Joi.object({
                page: Joi.number().integer().default(0),//input page no. as query
                limit: Joi.number().integer().default(5),//input limit per page as query
                order: Joi.string().default("dsc"), //order of sorting (asc for ascending and dsc for descending)
                orderBy: Joi.string().default("date"), //what to sort the list by (showTime/name)
            });
            // validate joi schema
            const data = await schema.validateAsync(req.query);
            // call and return controller
            // @ts-ignore
            return CtrlCinema.findAll(data.page, data.limit, data.order);
            }),
        );

        /**
         * Find certain cinema
         * for anyone
         */
        this.app.get("/cinema/certain", expressResponse(async (req: Request) => {
            // joi schema
            const schema = Joi.object({
                page: Joi.number().integer().default(0), //for paging
                limit: Joi.number().integer().default(5), //for limit per page
                cinemaName: Joi.string().required(), //name of the cinema to find by
            });
            // validate schema
            const data = await schema.validateAsync(req.query);
            // call and return controller
            // @ts-ignore
            return CtrlCinema.findCert(data.page, data.limit, data.cinemaName);
            }),
        );

        /**
         * Book a ticket
         * by user
         */
        this.app.post("/tickets/create", expressResponse(async (req: Request) => {
            //authenticating the admin
            //@ts-ignore
            if(!(req.session && req.session.user)){
                throw new Error("Not Authenticated")
            }
            //JOI schema
            const schema = Joi.object({
                numberOfTickets: Joi.number().integer().required(),//input no. of tickets to book as body
                showTime: Joi.string().required(),//input no. show timings as body
                movie: Joi.string().required(),//input movie name as body
                mid: Joi.string().required(),//input movie _id as body
            });
            //Validate JOI schema
            await schema.validateAsync(req.body);
            //call and return controller
            //@ts-ignore
            return CtrlTickets.create(req.body, req.session.user._id);
        }));
    }
}
