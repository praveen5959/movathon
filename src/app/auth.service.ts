import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { User } from './user.model'; 

import { auth } from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';

import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {

    user$: Observable<User>;
    userId;
    displayName;
    constructor(
        private afAuth: AngularFireAuth,
        private afs: AngularFirestore,
        private router: Router
    ) {this.user$ = this.afAuth.authState.pipe(
      switchMap(user => {
          // Logged in
        if (user) {
          return this.afs.doc<User>(`users/${user.uid}`).valueChanges();
        } else {
          // Logged out
          return of(null);
        }
      })
    ) }
    async googleSignin() {
      const provider = new auth.GoogleAuthProvider();
      const credential = await this.afAuth.auth.signInWithPopup(provider);      
      return this.updateUserData(credential.user);
      
    }
  
    private updateUserData(user) {
      // Sets user data to firestore on login

      this.router.navigate(['main']);
      const userRef: AngularFirestoreDocument<User> = this.afs.doc(`users/${user.uid}`);
      this.userId=user.uid;
      this.displayName=user.displayName;
      const data = { 
        uid: user.uid, 
        email: user.email, 
        displayName: user.displayName, 
        photoURL: user.photoURL
      } 
  
      return userRef.set(data, { merge: true })
  
    }
  
    async signOut() {
      await this.afAuth.auth.signOut();
      this.router.navigate(['/']);
    }

}