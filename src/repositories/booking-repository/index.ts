import { prisma } from "@/config";

async function getBookingByUser(userId: number) {
  return await prisma.booking.findMany({
    where: {
      userId
    },
    include: {
      Room: true
    }
  });
}

async function getBookingByRoomId(userId: number) {
  return await prisma.booking.findFirst({
    where: {
      userId
    },
    include: {
      Room: true
    }
  });
}

async function getBookingById(id: number) {
  return await prisma.booking.findFirst({
    where: {
      id
    },
    include: {
      Room: true
    }
  });
}

async function findRoomById(roomId: number) {
  return await prisma.room.findUnique({
    where: {
      id: roomId
    }
  });
}

async function findRoomBooking(roomId: number) {
  return prisma.booking.count({
    where: {
      roomId
    }
  });
}

async function createBookingUser(roomId: number, userId: number) {
  return await prisma.booking.create({
    data: {
      userId,
      roomId
    }
  });
}

async function upadteBookingUser(newRoomId: number, id: number) {
  return await prisma.booking.update({
    where: {
      id
    },
    data: {
      roomId: newRoomId
    }
  });
}

const bookingRepository = {
  getBookingByUser,
  findRoomById,
  findRoomBooking,
  createBookingUser,
  upadteBookingUser,
  getBookingByRoomId,
  getBookingById
};

export default bookingRepository;
