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
import com.google.cloud.Timestamp;
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
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.chrono.ChronoZonedDateTime;

public class UpdateReservation implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {
    final public static String COLLECTION_NAME = "reservations";
    @Override
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent apiGatewayProxyRequestEvent, Context context) {
        APIGatewayProxyResponseEvent responseEvent = new APIGatewayProxyResponseEvent();

        LambdaLogger logger = context.getLogger();

        String requestBody = apiGatewayProxyRequestEvent.getBody();
        logger.log("requestBody => "+requestBody);
        Gson gson = getGson();
        Reservation reservation = gson.fromJson(requestBody, Reservation.class);
        logger.log("Reservation=>"+reservation);
        logger.log("allowedToChange(reservation.getStartTime().getSeconds())->"+allowedToChange(reservation.getStartTime().getSeconds()));
    if (allowedToChange(reservation.getStartTime().getSeconds())){
        String documentId = apiGatewayProxyRequestEvent.getPathParameters().get("documentId");
        logger.log("Document ID -> "+ documentId +" is being changed!");
        initialisation(logger);
        Firestore firebaseDatabase = FirestoreClient.getFirestore();
        ApiFuture<WriteResult> collectionApiFuture = firebaseDatabase.collection(COLLECTION_NAME).document(documentId).set(reservation);
        try {
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
    public boolean allowedToChange(long seconds){
        Instant startTime = Instant.ofEpochSecond(seconds).minusSeconds(3600);
        System.out.println("Start Time->"+startTime);
        LocalDateTime currentTime = LocalDateTime.now();
        System.out.println("currentTime->"+ currentTime);
        System.out.println(currentTime.isBefore(ChronoZonedDateTime.from(startTime.atZone(ZoneId.systemDefault())).toLocalDateTime()));
        return currentTime.isBefore(ChronoZonedDateTime.from(startTime.atZone(ZoneId.systemDefault())).toLocalDateTime());
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
}
