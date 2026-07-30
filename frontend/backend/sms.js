const axios = require("axios");

async function sendSMS(phone, message) {

    console.log("SMS Function Called");
    console.log("Phone:", phone);
    console.log("Message:", message);

    try {
        const response = await axios.post(
            "https://control.msg91.com/api/v5/flow/",
            {
                recipients: [
                    {
                        mobiles: "91" + phone,
                        message: message,
                    },
                ],
            },
            {
                headers: {
                    authkey: process.env.MSG91_AUTH_KEY,
                    "Content-Type": "application/json",
                },
            }
        );

        console.log("SMS Sent:", response.data);

    } catch (err) {
        console.log("SMS Error:", err.response?.data || err.message);
    }
}

module.exports = sendSMS;