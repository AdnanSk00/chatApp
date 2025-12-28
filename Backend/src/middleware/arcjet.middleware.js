import aj from "../lib/arcjet.js";
import { isSpoofedBot } from "@arcjet/inspect";
// import { ENV } from "../lib/env.js";

export const arcjetProtection = async (req, res, next) => {
    try {
        // Bypass Arcjet in development or when no key is configured to avoid blocking local tools (Postman, curl)
        // if (!ENV.ARCJET_KEY || ENV.NODE_ENV !== 'production') {
        //     return next();
        // }

        const decision = await aj.protect(req)

        if (decision.isDenied()) {
            if (decision.reason.isRateLimit()) {
                return res.status(429).json({ message: "Rate limit exceeded. Please try again later."})
            } else if (decision.reason.isBot()) {
                return res.status(403).json({ message: "Bot access denied."})
            } else {
                return res.staus(403).json({ message: "Access denied by security policy." });
            }
        }

        // check for spoofed bots
        if (decision.results.some(isSpoofedBot)) {
            return res.status(403).json({ 
                error: "Spoofed bot detected",
                message: "Malicious bot activity detected.",
            });
        }

        next();

    } catch (error) {
        console.log("Arcjet Protection Error:", error);
        next();
    }
};