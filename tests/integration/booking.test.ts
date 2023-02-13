import app, { init } from "@/app";
import { cleanDb, generateValidToken } from "../helpers";
import supertest from "supertest";
import httpStatus from "http-status";
import { createHotel, createRoomWithHotelId, createUser } from "../factories";
import { createBooking } from "../factories/booking-factory";



beforeAll(async () => {
    await init();
    await cleanDb();
})

afterAll(async () => {
    await cleanDb();
})

const server = supertest(app)

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
            const user = await createUser()
            const token = await generateValidToken(user);

            const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(404);
        });

        it("should respond with status 200 and bookingId and Room if the user has a reservation", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const hotel = await createHotel();
            const room = await createRoomWithHotelId(hotel.id);
            const booking = await createBooking(user.id, room.id);

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
        })


    })
})

describe("/POST booking", () => {
    it("should respond with status 401 if no token is given", async () => {
        const response = await server.post("/booking");

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 401 if given token is not valid", async () => {
        const response = await server.post("/booking").set("Authorization", "Bearer XXXXXX");

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    describe("when token is valid", () => {
        it("should respond with 403 if body is empty", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({});
    
            expect(response.status).toBe(403)
            expect(response.text).toEqual("body is empty")

        })

        it("should respond with 404 if room doesn't exist", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const body = {roomId: -1}

            const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body)

            expect(response.status).toBe(404)
            expect(response.text).toEqual("room doesn't exist")
        })
    })

})