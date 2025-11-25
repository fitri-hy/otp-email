class NotificationService {
    static async sendSMS(phone, message) {
        console.log(`Sending SMS to ${phone}: ${message}`);
    }

    static async sendWhatsApp(phone, message) {
        console.log(`Sending WhatsApp to ${phone}: ${message}`);
    }
}

module.exports = NotificationService;
