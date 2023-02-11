import { bookUserRoom, getUserBooking } from "@/controllers/bookings-controller";
import { authenticateToken } from "@/middlewares";
import { Router } from "express";

const bookingsRouter = Router()

bookingsRouter
    .all("/*",authenticateToken)
    .get("/", getUserBooking) 
    .post("/", bookUserRoom)

export {bookingsRouter} 