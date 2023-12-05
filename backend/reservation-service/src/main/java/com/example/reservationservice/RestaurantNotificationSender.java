package com.example.reservationservice;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.LambdaLogger;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.SQSEvent;
import com.amazonaws.services.secretsmanager.AWSSecretsManager;
import com.amazonaws.services.secretsmanager.AWSSecretsManagerClientBuilder;
import com.amazonaws.services.secretsmanager.model.GetSecretValueRequest;
import com.amazonaws.services.secretsmanager.model.GetSecretValueResult;
import com.example.reservationservice.entity.Reservation;
import com.example.reservationservice.entity.Restaurant;
import com.google.api.core.ApiFuture;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.firestore.*;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.cloud.FirestoreClient;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.lang.reflect.Type;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

public class RestaurantNotificationSender {
    final public static String COLLECTION_NAME = "reservations";
    final public static String RESTAURANTS_COLLECTION_NAME = "restaurants";
    final public static String ORDERS_COLLECTION_NAME = "orders";

    public RestaurantNotificationSender() {
        if(FirebaseApp.getApps().size() <= 0){
            AWSSecretsManager client = AWSSecretsManagerClientBuilder.standard().build();
            GetSecretValueRequest getSecretValueRequest = new GetSecretValueRequest()
                    .withSecretId("firebasecredentials");
            GetSecretValueResult getSecretValueResponse = client.getSecretValue(getSecretValueRequest);

            String secret = getSecretValueResponse.getSecretString();
            try {
                GoogleCredentials credentials = GoogleCredentials.fromStream(new ByteArrayInputStream(secret.getBytes()));
                FirebaseOptions options = new FirebaseOptions.Builder()
                        .setCredentials(credentials)
                        .build();
                FirebaseApp.initializeApp(options);
            } catch (IOException e) {
                System.out.println("RestaurantNotificationSender->"+e.getMessage());
                e.printStackTrace();
            }
        }
    }

    public void scheduleNotificationRegardingReservation(String reservationId,String email){
        Reservation reservation = getReservation(reservationId);
        boolean orderExist = false;
        StringBuilder message = new StringBuilder();
        try {
            message.append("Dear Partner: ");
            orderExist = orderExist(reservationId);
            if(orderExist){
                message.append("\n Please check Order details for Following Reservation!");
            }else{
                message.append("\n Order for Following Reservation hasn't been Added!");
            }
            message.append("\n Date : " + reservation.getDate());
            message.append("\n From : " + reservation.getTimeSlot().getStart());
            message.append("\n End : " + reservation.getTimeSlot().getEnd());
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        String dateTime = getBeforeMinutesTimeFromCurrentTime(reservation.getDate()
                , reservation.getTimeSlot().getStart()
                , orderExist ? 0 : 10);

        SQSNotificationData sqsNotificationData =
                SQSNotificationData.builder().date(dateTime.split(" ")[0])
                        .email(email)
                        .type( orderExist ? "REGULAR" : "SCHEDULED" )
                        .from("Reservation-Order-Notification")
                        .id(reservationId)
                        .subject("Changes In Reservation Details")
                        .message(message.toString())
                        .time(dateTime.split(" ")[1])
                        .build();

        SQSNotificationData.sendNotification(sqsNotificationData);
    }
    public String getBeforeMinutesTimeFromCurrentTime(String date,String time,int before){
        String dateTimeString = date + " " + time;
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        LocalDateTime bookingDateTime = LocalDateTime.parse(dateTimeString, formatter);
        ZonedDateTime bookingZonedDateTime = ZonedDateTime.of(bookingDateTime, ZoneId.of("America/Halifax"));

        ZonedDateTime oneHourBeforeBooking = bookingZonedDateTime.minusMinutes(before);

        return oneHourBeforeBooking.format(formatter);
    }
    public boolean orderExist(String reservationId) throws Exception {
        Firestore firestore = FirestoreClient.getFirestore();
        CollectionReference collectionRef = firestore.collection(COLLECTION_NAME);
        Query query = collectionRef.whereEqualTo("ReservId", reservationId);

        ApiFuture<QuerySnapshot> querySnapshotApiFuture = query.get();
        System.out.println("Fetching Order Data!");
        System.out.println(querySnapshotApiFuture.get().getDocuments().isEmpty());
        return !querySnapshotApiFuture.get().getDocuments().isEmpty();
    }
    public Restaurant getRestaurantData(String documentId){
        Firestore firestore = FirestoreClient.getFirestore();
        DocumentReference documentReference = firestore.collection(RESTAURANTS_COLLECTION_NAME).document(documentId);
        ApiFuture<DocumentSnapshot> future = documentReference.get();
        try {
            DocumentSnapshot documentSnapshot = future.get();
            if(documentSnapshot.exists()){
                return documentSnapshot.toObject(Restaurant.class);
            }
            return null;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
    public Reservation getReservation(String documentId){
        Firestore firestore = FirestoreClient.getFirestore();
        DocumentReference documentReference = firestore.collection(COLLECTION_NAME).document(documentId);
        ApiFuture<DocumentSnapshot> future = documentReference.get();
        try {
            DocumentSnapshot documentSnapshot = future.get();
            if(documentSnapshot.exists()){
                return documentSnapshot.toObject(Reservation.class);
            }
            return null;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

}
