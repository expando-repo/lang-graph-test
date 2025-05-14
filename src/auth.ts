import { Auth, HTTPException } from "@langchain/langgraph-sdk/auth";
import { verifyToken } from "./jwt";

export const auth = new Auth()
  .authenticate(async (request: Request) => {
    const authorization = request.headers.get("authorization");
    const token = authorization?.split(" ").at(-1);

    if (token !== "test") {
        throw new HTTPException(401, { message: "Invalid token" });
      }
      return "test-user";

//    try {
//      const userId = (await verifyToken(token)) as string;
//      return userId;
//    } catch (error) {
//      throw new HTTPException(401, { message: "Invalid token", cause: error });
//    }
  })
  .on("*", ({ value, user }) => {
    // Add owner to the resource metadata
    if ("metadata" in value) {
      value.metadata ??= {};
      value.metadata.owner = user.identity;
    }

    // Filter the resource by the owner
    return { owner: user.identity };
  })
  .on("store", ({ user, value }) => {
    if (value.namespace != null) {
      // Assuming you organize information in store like (user_id, resource_type, resource_id)
      const [userId, resourceType, resourceId] = value.namespace;
      if (userId !== user.identity) {
        throw new HTTPException(403, { message: "Not authorized" });
      }
    }
  });