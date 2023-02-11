import { prisma } from "@/config"


async function getBookingByUser(userId: number){
    return await prisma.booking.findMany({
        where: {
            userId
        },
        include:{
            Room: true
        }
    })
}

async function findRoomById(roomId: number){
    return await prisma.room.findUnique({
        where:{
            id: roomId
        }
    })
}

async function findRoomBooking(roomId: number){
    return prisma.booking.count({
        where:{
            roomId
        }
    })
}

async function createBookingUser(roomId: number, userId:number){
    return await prisma.booking.create({
        data: {
            userId,
            roomId
        }
    })
}



const bookingRepository = {
    getBookingByUser,
    findRoomById,
    findRoomBooking,
    createBookingUser
}




export default bookingRepository