import { Elysia } from "elysia";

const meetingsApi = new Elysia({
  prefix: "/meetings",
})
  .get("/", () => {
    return "Hello Meetings";
  })
  .post("/", () => {
    return "Create Meeting";
  });

export default meetingsApi;
