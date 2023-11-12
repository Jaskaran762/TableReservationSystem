package com.example.reservationservice.services;

import com.amazonaws.services.lambda.runtime.LambdaLogger;
import com.amazonaws.services.secretsmanager.AWSSecretsManager;
import com.amazonaws.services.secretsmanager.AWSSecretsManagerClientBuilder;
import com.amazonaws.services.secretsmanager.model.GetSecretValueRequest;
import com.amazonaws.services.secretsmanager.model.GetSecretValueResult;
import com.example.reservationservice.entity.TimeSlot;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.Timestamp;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonDeserializer;
import com.google.gson.JsonObject;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class Utils {

    public static void initialisation(LambdaLogger logger){
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
    public static Gson getGson(){
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
    public static List<TimeSlot> generateTimeSlots(String startTime, String endTime, int slotDuration) {
        List<TimeSlot> timeSlots = new ArrayList<>();
        SimpleDateFormat timeFormat = new SimpleDateFormat("HH:mm");

        try {
            Date start = timeFormat.parse(startTime);
            Date end = timeFormat.parse(endTime);

            while (start.before(end)) {
                TimeSlot slot = new TimeSlot();
                slot.setStart(timeFormat.format(start));

                Date slotEnd = new Date(start.getTime() + (slotDuration - 1) * 60 * 1000);
                slot.setEnd(timeFormat.format(slotEnd));

                timeSlots.add(slot);

                start.setTime(slotEnd.getTime() + 60 * 1000);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return timeSlots;
    }

}
