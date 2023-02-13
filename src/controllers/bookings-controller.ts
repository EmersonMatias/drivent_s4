import { AuthenticatedRequest } from "@/middlewares";
import bookingsService from "@/services/bookings-service";
import { Response } from "express";

export async function getUserBooking(req: AuthenticatedRequest, res: Response) {
    const userId = req.userId

    try {
        const booking = await bookingsService.getUserBooking(userId)

        const userBooking = {
            id: booking.id,
            Room: booking.Room
        }
      
        return res.status(200).send(userBooking)

    } catch (error) {
        if (error.status) {
            return res.status(error.status).send(error.message)
        }
        return res.send(error)
    }
}   


export async function bookUserRoom(req: AuthenticatedRequest, res: Response){
    const userId = req.userId;
    const roomId: number = req.body.roomId;

    try{
        const sucess = await bookingsService.postBookUserRoom(roomId, userId);

        return res.status(200).send({bookingId: sucess.id});
    }catch(error){
        if(error.status){
            return res.status(error.status).send(error.message);
        }
        return res.status(403).send(error);
    }


}


export async function upadteBookUserRoom(req: AuthenticatedRequest, res: Response){
    const userId = req.userId
    const newRoomId: number = req.body.roomId
    const bookingId = req.params.bookingId

    try{

        const sucess = await bookingsService.upadteBookUserRoom(newRoomId, userId, Number(bookingId))

        return res.status(200).send({roomId: sucess.id})
    }catch(error){
        if(error.status){
            return res.status(error.status).send(error.message)
        }
        return res.send(error)
    }


}