package com.example.reservationservice;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.LambdaLogger;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.amazonaws.services.secretsmanager.AWSSecretsManager;
import com.amazonaws.services.secretsmanager.AWSSecretsManagerClientBuilder;
import com.amazonaws.services.secretsmanager.model.GetSecretValueRequest;
import com.amazonaws.services.secretsmanager.model.GetSecretValueResult;
import com.example.reservationservice.entity.Reservation;
import com.example.reservationservice.entity.Restaurant;
import com.google.api.core.ApiFuture;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.Timestamp;
import com.google.cloud.firestore.*;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.cloud.FirestoreClient;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonDeserializer;
import com.google.gson.JsonObject;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

public class UpdateReservation implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {
    final public static String COLLECTION_NAME = "reservations";
    final public static String RESTAURANTS_COLLECTION_NAME = "restaurants";
    final public static String ORDERS_COLLECTION_NAME = "orders";
    @Override
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent apiGatewayProxyRequestEvent, Context context) {
        APIGatewayProxyResponseEvent responseEvent = new APIGatewayProxyResponseEvent();

        LambdaLogger logger = context.getLogger();

        String requestBody = apiGatewayProxyRequestEvent.getBody();
        logger.log("requestBody => "+requestBody);
        Gson gson = getGson();
        Reservation reservation = gson.fromJson(requestBody, Reservation.class);
        logger.log("Reservation=>"+reservation);
        logger.log("allowedToChange(reservation.getStartTime().getSeconds())->"+allowedToChange(reservation.getDate(),reservation.getTimeSlot().getStart()));
    if (allowedToChange(reservation.getDate(),reservation.getTimeSlot().getStart())){
        String documentId = apiGatewayProxyRequestEvent.getPathParameters().get("documentId");
        logger.log("Document ID -> "+ documentId +" is being changed!");
        initialisation(logger);
        Firestore firebaseDatabase = FirestoreClient.getFirestore();
        ApiFuture<WriteResult> collectionApiFuture = firebaseDatabase.collection(COLLECTION_NAME).document(documentId).set(reservation);
        try {
            addNotificationBasedOnEvents(apiGatewayProxyRequestEvent.getQueryStringParameters(),documentId,reservation);
            logger.log("Changes Saved at->"+collectionApiFuture.get().getUpdateTime());
            responseEvent.setStatusCode(200);
            responseEvent.setBody(collectionApiFuture.get().getUpdateTime().toString());
        } catch (Exception e) {
            responseEvent.setBody(e.getMessage());
            logger.log("Exception occured!"+e.getMessage());
            throw new RuntimeException(e);
        }
    }

        return responseEvent;
    }
    public boolean allowedToChange(String date, String time) {
        String dateTimeString = date + " " + time;
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        LocalDateTime bookingDateTime = LocalDateTime.parse(dateTimeString, formatter);
        ZonedDateTime bookingZonedDateTime = ZonedDateTime.of(bookingDateTime, ZoneId.of("America/Halifax"));

        ZonedDateTime oneHourBeforeBooking = bookingZonedDateTime.minusHours(1);

        ZonedDateTime currentZonedDateTime = ZonedDateTime.now(ZoneId.of("America/Halifax"));

        return currentZonedDateTime.isBefore(oneHourBeforeBooking);
    }
    public void initialisation(LambdaLogger logger){
        if(FirebaseApp.getApps().size() <= 0){
            AWSSecretsManager client = AWSSecretsManagerClientBuilder.standard().build();
            GetSecretValueRequest getSecretValueRequest = new GetSecretValueRequest()
                    .withSecretId("firebasecredentials");
            GetSecretValueResult getSecretValueResponse = client.getSecretValue(getSecretValueRequest);

            String secret = getSecretValueResponse.getSecretString();
            logger.log("secret->"+secret);
            try {
                GoogleCredentials credentials = GoogleCredentials.fromStream(new ByteArrayInputStream(secret.getBytes()));
                FirebaseOptions options = new FirebaseOptions.Builder()
                        .setCredentials(credentials)
                        .build();
                FirebaseApp.initializeApp(options);
            } catch (IOException e) {
                logger.log(e.getMessage());
                e.printStackTrace();
            }
        }
    }
    public Gson getGson(){
        return new GsonBuilder()
                .registerTypeAdapter(
                        com.google.cloud.Timestamp.class,
                        (JsonDeserializer<Timestamp>)
                                (json, type, jsonDeserializationContext) -> {
                                    JsonObject jsonObject = json.getAsJsonObject();
                                    long seconds = jsonObject.get("_seconds").getAsLong();
                                    System.out.println("seconds->"+seconds);
                                    int nanoseconds = jsonObject.get("_nanoseconds").getAsInt();
                                    return com.google.cloud.Timestamp.ofTimeSecondsAndNanos(seconds,nanoseconds);
                                })
                .create();
    }
    public void notifyRestaurantRegardingReservation(Reservation newReservation, String id) {
        Restaurant restaurant = this.getRestaurantData(newReservation.getRestaurantId());
        Reservation oldReservation = this.getReservation(id);
        StringBuilder message = new StringBuilder();
        message.append("Dear Partner: ");
        message.append("\n A reservation details has been changed as mentioned below.");
        message.append(this.generateUpdateMessage(oldReservation, newReservation));
        SQSNotificationData sqsNotificationData = SQSNotificationData.builder().date(newReservation.getDate()).email(restaurant.getOwner()).type("REGULAR").from("Reservation-Details-Update").id(id).subject("Changes In Reservation Details").message(message.toString()).time(newReservation.getTimeSlot().getStart()).build();
        SQSNotificationData.sendNotification(sqsNotificationData);
    }
    public void addNotificationBasedOnEvents(Map<String,String> queryParameters,String documentId,Reservation reservation){
        System.out.println(" Adding Notifications to the Event.");
        System.out.println(queryParameters);
        if( queryParameters != null && queryParameters.containsKey("from") && queryParameters.get("from").equals("statusToggle")){
            System.out.println("The Event is type of Status Toggle");
            notifyCustomerRegardingTheirReservationConfirmation(reservation,documentId);
        }else {
            notifyRestaurantRegardingReservation(reservation, documentId);
        }
        notifyCustomerRegardingTheirReservation(reservation,documentId);
        scheduledNotificationCreatorForRestaurant(reservation, documentId, reservation.getRestaurantId());
    }
    public void scheduledNotificationCreatorForRestaurant(Reservation reservation,String reservationId,String id){
        System.out.println("Setting up Notification");
        Restaurant restaurant = getRestaurantData(id);
        System.out.println("RestuarnatDetails-> "+restaurant);
    System.out.println("ReservationId-> "+reservationId);
        if(restaurant != null){
            HashMap<String,String> message = new HashMap<>();
            message.put("restaurantId",reservation.getRestaurantId());

            String dateTime = getBeforeMinutesTimeFromCurrentTime(reservation.getDate(), reservation.getTimeSlot().getStart(), 60);
            System.out.println("Updated Code!!");
            SQSNotificationData sqsNotificationData =
                    SQSNotificationData.builder().date(reservation.getDate())
                            .email(restaurant.getOwner())
                            .date(dateTime.split(" ")[0])
                            .type("SCHEDULED")
                            .from("RESTAURANT-NOTIFIER")
                            .id(reservationId)
                            .subject("Reminder For Reservation To Restaurant!")
                            .restaurantId(reservation.getRestaurantId())
                            .message(new Gson().toJson(message))
                            .time(dateTime.split(" ")[1])
                            .build();

            SQSNotificationData.sendNotification(sqsNotificationData);
        }
    }
    public void notifyCustomerRegardingTheirReservation(Reservation reservation,String id){
        System.out.println("Setting up Notification");

        StringBuilder message = new StringBuilder();
        message.append(" Dear Customer,");
        message.append(" Your Table has been Scheduled at "+reservation.getRestaurantId());
        message.append(" \n Date : " + reservation.getDate());
        message.append(" \n From : " + reservation.getTimeSlot().getStart());
        message.append(" \n Number of Person : "+reservation.getNumberOfPerson());

        String dateTime = getBeforeMinutesTimeFromCurrentTime(reservation.getDate(), reservation.getTimeSlot().getStart(), 30);

        SQSNotificationData sqsNotificationData =
                SQSNotificationData.builder().date(reservation.getDate())
                        .email(reservation.getUserId())
                        .date(dateTime.split(" ")[0])
                        .type("SCHEDULED")
                        .from("Customer-REMINDER")
                        .id(id)
                        .subject("Reminder For Reservation")
                        .message(message.toString())
                        .time(dateTime.split(" ")[1])
                        .build();

        SQSNotificationData.sendNotification(sqsNotificationData);
    }
    public void notifyCustomerRegardingTheirReservationConfirmation(Reservation reservation,String id){
        StringBuilder message = new StringBuilder();
        message.append(" Dear Customer,");
        message.append(" Your Reservation has been confirmed by the restaurant.");
        message.append(" \n Table has been Scheduled at "+reservation.getRestaurantId());
        message.append(" \n Date : " + reservation.getDate());
        message.append(" \n From : " + reservation.getTimeSlot().getStart());
        message.append(" \n Number of Person : "+reservation.getNumberOfPerson());

        SQSNotificationData sqsNotificationData =
                SQSNotificationData.builder().date(reservation.getDate())
                        .email(reservation.getUserId())
                        .type("REGULAR")
                        .from("Reservation-Confirmation")
                        .id(id)
                        .subject("Confirmation Regarding Your Reservation")
                        .message(message.toString())
                        .time(reservation.getTimeSlot().getStart())
                        .build();

        SQSNotificationData.sendNotification(sqsNotificationData);
    }
    public String generateUpdateMessage(Reservation oldReservation, Reservation newReservation) {
        StringBuilder message = new StringBuilder("\n Reservation details:\n");
        if (!Objects.equals(oldReservation.isDeleted(), newReservation.isDeleted())) {
            message.append("Reservation Has Been delete ");
            return message.toString();
        }
        message.append("Number of persons updated: ").append(newReservation.getNumberOfPerson()).append("\n");
        message.append("Date : ").append(newReservation.getDate()).append("\n");
        message.append("Table name : ").append(newReservation.getTableName()).append("\n");

        message.append("Time slot : \n")
                .append("\t From : ")
                .append(newReservation.getTimeSlot().getStart())
                .append("\t To : ")
                .append(newReservation.getTimeSlot().getEnd());


        return message.toString();
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
    public Restaurant getRestaurantData(String documentId){
    System.out.println("Fetching Restaurant Data...");
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
      System.out.println("En Error Occured-> "+e.getMessage());
            throw new RuntimeException(e);
        }
    }
    public String getBeforeMinutesTimeFromCurrentTime(String date,String time,int before){
        String dateTimeString = date + " " + time;
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        LocalDateTime bookingDateTime = LocalDateTime.parse(dateTimeString, formatter);
        ZonedDateTime bookingZonedDateTime = ZonedDateTime.of(bookingDateTime, ZoneId.of("America/Halifax"));

        ZonedDateTime oneHourBeforeBooking = bookingZonedDateTime.minusMinutes(before);

        return oneHourBeforeBooking.format(formatter);
    }
}