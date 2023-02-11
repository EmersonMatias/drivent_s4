import bookingRepository from "@/repositories/booking-repository"


async function getUserBooking(userId: number){

    const bookingExist = await bookingRepository.getBookingByUser(userId)

    if(!bookingExist[0]) throw {message: "Usuário não possui reserva", status: 404}

    return bookingExist[0]
}

async function postBookUserRoom(roomId: number, userId: number){
    if(!roomId) throw {message: "room empty", status: 403}

    const room = await bookingRepository.findRoomById(roomId)

    if(!room) throw {message: "room doesn't exist", status: 404}

    const roomAvailable = await bookingRepository.findRoomBooking(roomId)
    
    if(room.capacity === roomAvailable) throw {message: "room is filled", status: 403}

    const booking = await bookingRepository.createBookingUser(roomId, userId)
    
    return booking
}

const bookingsService = {
    getUserBooking,
    postBookUserRoom
}

export default bookingsService 