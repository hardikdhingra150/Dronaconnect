import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
  } from "firebase/auth";
  import { doc, setDoc, getDoc } from "firebase/firestore";
  import { auth, db } from "./config";
  
  const googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({ prompt: "select_account" });
  
  export const loginWithEmail = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);
  
  export const signupWithEmail = async (email, password, name) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "users", cred.user.uid), {
      name,
      email,
      role: "student",
      rollNo: "",
      department: "",
      createdAt: new Date().toISOString(),
    });
    return cred;
  };
  
  export const loginWithGoogle = async () => {
    const cred = await signInWithPopup(auth, googleProvider);
    const userRef = doc(db, "users", cred.user.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        name: cred.user.displayName,
        email: cred.user.email,
        role: "student",
        rollNo: "",
        department: "",
        createdAt: new Date().toISOString(),
      });
    }
    return cred;
  };
  
  export const logout = () => signOut(auth);
  