import app, { init } from "@/app";
import { cleanDb, generateValidToken } from "../helpers";
import supertest from "supertest";
import httpStatus from "http-status";
import { createEnrollmentWithAddress, createHotel, createRoomWithHotelId, createTicketTypeWithHotel, createUser, createTicket, createTicketTypeRemote, createTicketTypeWithoutHotel } from "../factories";
import { createBooking } from "../factories/booking-factory";

beforeAll(async () => {
  await init();
  await cleanDb();
});

afterEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe("/GET booking", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/booking");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const response = await server.get("/booking").set("Authorization", "Bearer XXXXXX");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 404 if user does not have reservation", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
    });

    it("should respond with status 200 and bookingId and Room if the user has a reservation", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      await createBooking(user.id, room.id);

      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: expect.any(Number),
        Room: expect.objectContaining({
          id: expect.any(Number),
          name: expect.any(String),
          capacity: expect.any(Number),
          hotelId: expect.any(Number)
        })
      });
    });
  });
});

describe("/POST booking", () => {
  it("should respond with status 401 if no token is given", async () => {   const response = await server.post("/booking");
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {    const response = await server.post("/booking").set("Authorization", "Bearer XXXXXX");
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with 403 if body is empty", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({});

      expect(response.status).toBe(403);
      expect(response.text).toEqual("body is empty");
    });

    it("should respond with 404 if room doesn't exist", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const body = { roomId: -1 };

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);

      expect(response.status).toBe(404);
      expect(response.text).toEqual("room doesn't exist");
    });

    it("should responde with 402 if ticket was not paid", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const tickeyType = await createTicketTypeWithHotel();
      const enrollment = await createEnrollmentWithAddress(user);
      await createTicket(enrollment.id, tickeyType.id, "RESERVED");
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      const body = { roomId: room.id };

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
      expect(response.text).toEqual("payment required");
    });

    it("should responde with 401 if ticket is remote", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const tickeyType = await createTicketTypeRemote();
      const enrollment = await createEnrollmentWithAddress(user);
      await createTicket(enrollment.id, tickeyType.id, "PAID");
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      const body = { roomId: room.id };

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);

      expect(response.status).toBe(401);
      expect(response.text).toEqual("remote event");
    });

    it("should responde with 401 if hotel is not include", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const tickeyType = await createTicketTypeWithoutHotel();
      const enrollment = await createEnrollmentWithAddress(user);
      await createTicket(enrollment.id, tickeyType.id, "PAID");
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      const body = { roomId: room.id };

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);

      expect(response.status).toBe(401);
      expect(response.text).toEqual("hotel is not include");
    });

    it("should respond with 403 if room is full", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const tickeyType = await createTicketTypeWithHotel();
      const enrollment = await createEnrollmentWithAddress(user);
      await createTicket(enrollment.id, tickeyType.id, "PAID");
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      await createBooking(user.id, room.id);
      await createBooking(user.id, room.id);
      await createBooking(user.id, room.id);
      const body = { roomId: room.id };

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);

      expect(response.status).toBe(403);
      expect(response.text).toEqual("room is filled");
    });

    it("should respond with 200 and return bookingId if sucess", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const tickeyType = await createTicketTypeWithHotel();
      const enrollment = await createEnrollmentWithAddress(user);
      await createTicket(enrollment.id, tickeyType.id, "PAID");
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      const body = { roomId: room.id };

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({ bookingId: expect.any(Number) });
    });
  });
});

describe("/PUT booking/:bookingId", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.put("/booking");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const response = await server.put("/booking").set("Authorization", "Bearer XXXXXX");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with 403 if body is empty", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const tickeyType = await createTicketTypeWithHotel();
      const enrollment = await createEnrollmentWithAddress(user);
      await createTicket(enrollment.id, tickeyType.id, "PAID");
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      const booking = await createBooking(user.id, room.id);
      const response = await server.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`).send({});

      expect(response.status).toBe(403);
      expect(response.text).toEqual("body is empty");
    });

    it("should respond with 403 if booking doesn't exist", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const tickeyType = await createTicketTypeWithHotel();
      const enrollment = await createEnrollmentWithAddress(user);
      await createTicket(enrollment.id, tickeyType.id, "PAID");
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      const body = { roomId: room.id };

      const response = await server.put("/booking/-1").set("Authorization", `Bearer ${token}`).send(body);

      expect(response.status).toBe(401);
      expect(response.text).toEqual("booking doesn't exist");
    });

    it("should respond with 401 user doesn't have a booking", async () => {
      const user = await createUser();
      const user2 = await createUser();
      const token = await generateValidToken(user);
      const tickeyType = await createTicketTypeWithHotel();
      const enrollment = await createEnrollmentWithAddress(user2);
      await createTicket(enrollment.id, tickeyType.id, "PAID");
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      const room2 = await createRoomWithHotelId(hotel.id);
      const booking = await createBooking(user2.id, room.id);
      const body = { roomId: room2.id };

      const response = await server.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`).send(body);

      expect(response.status).toBe(401);
      expect(response.text).toEqual("user doesn't have a booking");
    });

    it("should respond with 404 if room doesn't exist", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const tickeyType = await createTicketTypeWithHotel();
      const enrollment = await createEnrollmentWithAddress(user);
      await createTicket(enrollment.id, tickeyType.id, "PAID");
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      const booking = await createBooking(user.id, room.id);
      const body = { roomId: -1 };

      const response = await server.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`).send(body);

      expect(response.status).toBe(404);
      expect(response.text).toEqual("room doesn't exist");
    });

    it("should respond with 403 if room is full", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const tickeyType = await createTicketTypeWithHotel();
      const enrollment = await createEnrollmentWithAddress(user);
      await createTicket(enrollment.id, tickeyType.id, "PAID");
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      const room2 = await createRoomWithHotelId(hotel.id);
      const booking = await createBooking(user.id, room.id);
      await createBooking(user.id, room2.id);
      await createBooking(user.id, room2.id);
      await createBooking(user.id, room2.id);
      const body = { roomId: room2.id };

      const response = await server.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`).send(body);

      expect(response.status).toBe(403);
      expect(response.text).toEqual("room is filled");
    });

    it("should respond with status 200 and return roomId if sucess", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const tickeyType = await createTicketTypeWithHotel();
      const enrollment = await createEnrollmentWithAddress(user);
      await createTicket(enrollment.id, tickeyType.id, "PAID");
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      const booking = await createBooking(user.id, room.id);
      const room2 = await createRoomWithHotelId(hotel.id);
      const body = { roomId: room2.id };

      const response = await server.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`).send(body);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({ bookingId: expect.any(Number) });
    });
  });
});
