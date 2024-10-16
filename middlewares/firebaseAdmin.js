const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const sendPushNotification = (token, payload) => {
    return admin.messaging().sendToDevice(token, payload)
      .then(response => {
        console.log('Successfully sent message:', response);
      })
      .catch(error => {
        console.log('Error sending message:', error);
      });
    };

module.exports = {
    admin,
    sendPushNotification,
};
