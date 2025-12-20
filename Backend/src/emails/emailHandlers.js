import { sender, resendClient } from "../lib/resend.js";
import { createWelcomeEmailTemplate } from "./emailTemplates.js";

export const sendWelcomeEmail = async (email, name, clientURL) => {
    if (!name) console.warn("sendWelcomeEmail: missing name for", email);
    else console.log("sendWelcomeEmail: name =", name);

    const {data, error} = await resendClient.emails.send({
        from: `${sender.name} <${sender.email}>`,
        to: email,
        subject: "Welcome to chatApp!",
        html: createWelcomeEmailTemplate(name, clientURL)
    })

    if(error) {
        console.error("Error sending welcome email:", error);
        throw new Error("Failed to send welcome email");
    }

    console.log("Welcome Email sent successfully", data);
}