import { bookUserRoom, getUserBooking, upadteBookUserRoom } from "@/controllers/bookings-controller";
import { authenticateToken } from "@/middlewares";
import { Router } from "express";

const bookingsRouter = Router();

bookingsRouter
  .all("/*", authenticateToken)
  .get("/", getUserBooking) 
  .post("/", bookUserRoom)
  .put("/:bookingId", upadteBookUserRoom);

export { bookingsRouter }; 
