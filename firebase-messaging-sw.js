importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyDPnicGdGn7WhXjswl8av-kXqQi7XP-_ho",
  projectId: "banquet-team-57e79",
  messagingSenderId: "375529452283",
  appId: "1:375529452283:web:4dda255e152cf89caff65e"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: 'https://tevfikcanerozgen-ops.github.io/banquet-team/icon.png',
    badge: 'https://tevfikcanerozgen-ops.github.io/banquet-team/badge.png'
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});
