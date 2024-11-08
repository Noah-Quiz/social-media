// notificationService.js
const admin = require("firebase-admin");
const serviceAccount = require('../serviceAccountKey.json');

// Khởi tạo Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const pushNotification = async (followUser, followerName) => {
    const fcmToken = followUser?.fcmToken;

    if (fcmToken) {
        const message = `${followerName} đã theo dõi bạn!`;
        const payload = {
            notification: {
                title: "Có người theo dõi bạn!",
                body: message,
            },
            token: fcmToken,
        };

        try {
            const response = await admin.messaging().send(payload);
            console.log("Notification sent successfully:", response);
        } catch (error) {
            console.error("Error sending notification:", error);
            throw new Error("Failed to send notification");
        }
    } else {
        console.error('FCM Token not found for user:', followUser._id);
    }
};


module.exports = { admin, pushNotification };
