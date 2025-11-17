const {onRequest} = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const logger = require("firebase-functions/logger");

// Initialize Firebase Admin
admin.initializeApp();

/**
 * Cloud Function to generate a custom token for Web SDK authentication
 * This solves the iOS WKWebView auth sync issue by:
 * 1. Accepting an ID token from the native Firebase SDK
 * 2. Verifying the token
 * 3. Generating a custom token that can be used with the Web SDK
 */
exports.generateCustomToken = onRequest(
  {
    cors: true, // Enable CORS for all origins (restrict in production)
    region: "us-central1",
  },
  async (req, res) => {
    // Only allow POST requests
    if (req.method !== "POST") {
      logger.warn("Invalid method:", req.method);
      return res.status(405).json({error: "Method not allowed"});
    }

    try {
      const {idToken} = req.body;

      if (!idToken) {
        logger.warn("Missing idToken in request");
        return res.status(400).json({error: "idToken is required"});
      }

      logger.info("Verifying ID token...");

      // Verify the ID token from native SDK
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const uid = decodedToken.uid;

      logger.info("Token verified for user:", uid);

      // Generate a custom token for the Web SDK
      const customToken = await admin.auth().createCustomToken(uid);

      logger.info("Custom token generated successfully for user:", uid);

      // Return the custom token
      return res.status(200).json({
        customToken: customToken,
        uid: uid,
      });
    } catch (error) {
      logger.error("Error generating custom token:", error);

      // Handle specific error cases
      if (error.code === "auth/id-token-expired") {
        return res.status(401).json({error: "ID token expired"});
      } else if (error.code === "auth/id-token-revoked") {
        return res.status(401).json({error: "ID token revoked"});
      } else if (error.code === "auth/invalid-id-token") {
        return res.status(401).json({error: "Invalid ID token"});
      }

      return res.status(500).json({
        error: "Failed to generate custom token",
        message: error.message,
      });
    }
  }
);
