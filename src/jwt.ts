import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "tajny-kluc"; // nastav si správně v .env

export async function verifyToken(token?: string): Promise<string> {
  if (!token) {
    throw new Error("Token not provided");
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Vracíme nějaký identifikátor uživatele – záleží na tvé payload struktuře
    return typeof decoded === "object" && "sub" in decoded ? decoded.sub as string : "unknown";
  } catch (err) {
    throw new Error("Token verification failed");
  }
}
