package com.example.reservationservice.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;

import java.io.FileInputStream;
import java.io.IOException;
public class FirebaseInitialization {
    public void initialisation(){
        FileInputStream serviceAccount = null;
        try {
      serviceAccount =
          new FileInputStream("./restaurant-reservation-bb560-firebase-adminsdk-brusl-4ddb6af32f.json");
            FirebaseOptions options = new FirebaseOptions.Builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();
            FirebaseApp.initializeApp(options);
        } catch (IOException e) {
            e.printStackTrace();
            throw new RuntimeException(e);
        }
    }
}
