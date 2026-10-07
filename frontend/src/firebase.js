import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAqVOghi-Fp4878-hqXln0M2eVNjnSI3H0",
  authDomain: "ceylonplanx.firebaseapp.com",
  projectId: "ceylonplanx",
  storageBucket: "ceylonplanx.firebasestorage.app",
  messagingSenderId: "906050970080",
  appId: "1:906050970080:web:b0de5cbde0ad9169158b85",
  measurementId: "G-7BR6P8L628"
};

// Firebase Init
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export const savePredictionToFirebase = async (userAnswers, predictionResult) => {
  try {
    await addDoc(collection(db, "predictions"), {
      answers: userAnswers,
      recommendation: predictionResult,
      createdAt: serverTimestamp()
    });
    console.log("Prediction saved to Firebase Firestore successfully!");
  } catch (error) {
    console.error("Error saving to Firebase:", error);
  }
};