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
import com.google.api.core.ApiFuture;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.WriteResult;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.cloud.FirestoreClient;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonDeserializer;
import com.google.gson.JsonObject;

import java.io.ByteArrayInputStream;
import java.io.IOException;

public class CreateReservation implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {
    final public static String COLLECTION_NAME = "reservations";
    @Override
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent apiGatewayProxyRequestEvent, Context context) {
        APIGatewayProxyResponseEvent responseEvent = new APIGatewayProxyResponseEvent();
        LambdaLogger logger = context.getLogger();
        initialisation(logger);
        String requestBody = apiGatewayProxyRequestEvent.getBody();
        logger.log("requestBody => "+requestBody);
        Gson gson = getGson();
        Reservation reservation = gson.fromJson(requestBody, Reservation.class);
        logger.log("Reservation=>"+reservation);
        Firestore firebaseDatabase = FirestoreClient.getFirestore();
        DocumentReference documentReference = firebaseDatabase.collection(COLLECTION_NAME).document();
        ApiFuture<WriteResult> collectionApiFuture = documentReference.set(reservation);
        try {
            logger.log("Saved at->"+collectionApiFuture.get().getUpdateTime());
            createTableReservationNotification(reservation,documentReference.getId());
            responseEvent.setStatusCode(201);
            responseEvent.setBody(collectionApiFuture.get().getUpdateTime().toString());
        } catch (Exception e) {
            responseEvent.setBody(e.getMessage());
            logger.log("Exception occured!"+e.getMessage());
            throw new RuntimeException(e);
        }
        return responseEvent;
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
                        (JsonDeserializer<com.google.cloud.Timestamp>)
                                (json, type, jsonDeserializationContext) -> {
                                    JsonObject jsonObject = json.getAsJsonObject();
                                    long seconds = jsonObject.get("_seconds").getAsLong();
                                    System.out.println("seconds->"+seconds);
                                    int nanoseconds = jsonObject.get("_nanoseconds").getAsInt();
                                    return com.google.cloud.Timestamp.ofTimeSecondsAndNanos(seconds,nanoseconds);
                                })
                .create();
    }

    public void createTableReservationNotification(Reservation reservation,String id){
        System.out.println("Setting up Notification");

        StringBuilder message = new StringBuilder();
        message.append(" Dear Partner,");
        message.append(" A Customer has reserved a table at your Restaurant ");
        message.append(" \n Date : " + reservation.getDate());
        message.append(" \n From : " + reservation.getTimeSlot().getStart());
        message.append(" \n To : " + reservation.getTimeSlot().getEnd());
        message.append(" \n Number of Person : "+reservation.getNumberOfPerson());

    SQSNotificationData sqsNotificationData =
        SQSNotificationData.builder().date(reservation.getDate())
                .email(reservation.getUserId())
                .type("REGULAR")
                .from("Reservation")
                .subject("New Reservation Added!")
                .id(id)
                .message(message.toString())
                .time(reservation.getTimeSlot().getStart())
                .build();

    SQSNotificationData.sendNotification(sqsNotificationData);
    }
}
