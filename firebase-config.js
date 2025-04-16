// Firebase configuration
// IMPORTANT: Replace with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyAcNSreHrjn_2oD_J0qSobV3QGgco92O5E",
  authDomain: "id-card-generator-30b5e.firebaseapp.com",
  projectId: "id-card-generator-30b5e",
  storageBucket: "id-card-generator-30b5e.firebasestorage.app",
  messagingSenderId: "415880752391",
  appId: "1:415880752391:web:4fefc9f2e98028ae7d29a2"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Export the database reference to be used in other files
const db = firebase.firestore();