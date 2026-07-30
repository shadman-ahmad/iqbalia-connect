const axios = require("axios");

const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
console.log("PHONE_NUMBER_ID =", PHONE_NUMBER_ID);
console.log(
  "ACCESS_TOKEN =",
  ACCESS_TOKEN ? ACCESS_TOKEN.substring(0, 25) + "..." : "undefined"
);

async function sendWhatsApp(phone, studentName) {
    try {
        const url = `https://graph.facebook.com/v23.0/${PHONE_NUMBER_ID}/messages`;

        await axios.post(
            url,
            {
                messaging_product: "whatsapp",
                to: `91${phone}`,
                type: "text",
                text: {
                    body:
`Dear Parent,

This is to inform you that ${studentName} was marked ABSENT today at IQBALIA Junior College.

If this absence is unexpected, please contact the college.

Thank you.
IQBALIA Junior College`
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${ACCESS_TOKEN}`,
                    "Content-Type": "application/json",
                },
            }
        );

        console.log("✅ WhatsApp sent to", phone);

    } catch (err) {
        console.error(
            "❌ WhatsApp Error:",
            err.response?.data || err.message
        );
    }
}

module.exports = sendWhatsApp;