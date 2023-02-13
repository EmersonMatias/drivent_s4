import bookingRepository from "@/repositories/booking-repository"
import enrollmentRepository from "@/repositories/enrollment-repository"
import ticketRepository from "@/repositories/ticket-repository"
import httpStatus from "http-status"


async function getUserBooking(userId: number){

    const bookingExist = await bookingRepository.getBookingByUser(userId)

    if(!bookingExist[0]) throw {message: "Usuário não possui reserva", status: 404}

    return bookingExist[0]
}

async function postBookUserRoom(roomId: number, userId: number){
    if(!roomId) throw {message: "body is empty", status: 403}

    const room = await bookingRepository.findRoomById(roomId)

    if(!room) throw {message: "room doesn't exist", status: 404}

    const enrollmentUserId = await enrollmentRepository.findWithAddressByUserId(userId)
  
    const ticketUser= await ticketRepository.findTicketByEnrollmentId(enrollmentUserId.id)

    if(ticketUser.status !== "PAID") throw {message:"Error Payment Required" , status: httpStatus.PAYMENT_REQUIRED}

    const ticketType = await ticketRepository.findTicketTypeById(ticketUser.ticketTypeId)

    if(ticketType.isRemote === true) throw {message: "Remote event", status: 401}
    if(ticketType.includesHotel === false) throw {message: "Hotel doesn't include", status: 401}

    const roomAvailable = await bookingRepository.findRoomBooking(roomId)
    
    if(room.capacity === roomAvailable) throw {message: "room is filled", status: 403}

    const booking = await bookingRepository.createBookingUser(roomId, userId)
    
    return booking
}

async function upadteBookUserRoom(newRoomId: number, userId: number, bookingId: number){
    if(!newRoomId) throw {message: "room empty", status: 403}

    const bookExist = await bookingRepository.getBookingById(bookingId)

    //Verificar se existe reserva do quarto
    if(!bookExist) throw {message: "book doesn't exist", status: 401}

    //Verificar se a reserva do quarto é realmente do usuário
    if(bookExist.userId !== userId) throw {message: "user doesn't have a book", status: 401}

    const room = await bookingRepository.findRoomById(newRoomId)
    //Verificar se novo quarto existe
    if(!room) throw {message: "room doesn't exist", status: 404}

    const roomAvailable = await bookingRepository.findRoomBooking(newRoomId)
    //Verificar se novo quarto tem vagas
    if(room.capacity === roomAvailable) throw {message: "room is filled", status: 403}
   //Cadastrando atualização
    const newBooking = await bookingRepository.upadteBookingUser(newRoomId, bookingId)
    
    return newBooking
}

const bookingsService = {
    getUserBooking,
    postBookUserRoom,
    upadteBookUserRoom
}

export default bookingsService 