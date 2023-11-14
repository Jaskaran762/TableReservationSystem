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
import com.example.reservationservice.dto.ReservationDTO;
import com.example.reservationservice.entity.Reservation;
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
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

public class GetReservations implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {
    final public static String COLLECTION_NAME = "reservations";
    @Override
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent apiGatewayProxyRequestEvent, Context context) {
        APIGatewayProxyResponseEvent  responseEvent =  new APIGatewayProxyResponseEvent();
        LambdaLogger logger = context.getLogger();
        initialisation(context.getLogger());

        HashMap<String,String> headers = new HashMap<>();
        headers.put("Content-Type","application/json");

        Map<String,String> queryParams = apiGatewayProxyRequestEvent.getQueryStringParameters();
        try {
            if(queryParams !=null ) {
                logger.log(queryParams.toString());
            }

            responseEvent.setBody(getGson().toJson(getReservationsBasedOnCondition(queryParams,logger)));
            responseEvent.setStatusCode(200);
        } catch (Exception e) {
            responseEvent.setBody(e.getMessage());
            responseEvent.setStatusCode(404);
            throw new RuntimeException(e);
        }
        responseEvent.setHeaders(headers);
        return responseEvent;
    }
    public List<ReservationDTO> getReservationsBasedOnCondition(Map<String,String> queryParams,LambdaLogger logger)
            throws Exception {
        List<ReservationDTO> reservations = new LinkedList<>();
        Firestore firestore = FirestoreClient.getFirestore();
        CollectionReference collectionRef = firestore.collection(COLLECTION_NAME);
        Query query = null;
        if(queryParams!=null){
            String date = queryParams.get("date");
            String restaurantId = queryParams.get("restaurantId");
            String userId = queryParams.get("userId");
            logger.log(queryParams.toString());
            logger.log(queryParams.getOrDefault("isAcceptedByRestaurant",null));
            if(date != null && !date.equals("")){
                query = collectionRef.whereEqualTo("date",date);
            }
            if(restaurantId != null && !restaurantId.equals("")){
                if(query != null){
                    query = query.whereEqualTo("restaurantId",restaurantId);
                }else{
                    query = collectionRef.whereEqualTo("restaurantId",restaurantId);
                }
            }
            if(userId != null && !userId.equals("")){
                if(query != null){
                    query = query.whereEqualTo("userId",userId);
                }else{
                    query = collectionRef.whereEqualTo("userId",userId);
                }
            }
            if(queryParams.getOrDefault("isAcceptedByRestaurant",null) != null){
                boolean isAcceptedByRestaurant = Boolean.parseBoolean(queryParams.get("isAcceptedByRestaurant"));
                logger.log("isAcceptedByRes->"+isAcceptedByRestaurant);
                if(query != null){
                    query = query.whereEqualTo("acceptedByRestaurant",isAcceptedByRestaurant);
                }else{
                    query = collectionRef.whereEqualTo("acceptedByRestaurant",isAcceptedByRestaurant);
                }
            }
        }
        ApiFuture<QuerySnapshot> querySnapshotApiFuture = query != null ? query.get() : collectionRef.get();
        for (QueryDocumentSnapshot document : querySnapshotApiFuture.get().getDocuments()) {
            ReservationDTO reservation = document.toObject(ReservationDTO.class);
            System.out.println("Reservation->"+reservation);
            reservation.setDocumentId(document.getId());
            reservations.add(reservation);
        }
        return reservations;
    }
    public void initialisation(LambdaLogger logger){
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
