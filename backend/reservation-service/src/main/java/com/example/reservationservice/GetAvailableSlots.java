package com.example.reservationservice;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.LambdaLogger;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.example.reservationservice.entity.Reservation;
import com.example.reservationservice.entity.TimeSlot;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;

import java.util.*;

import static com.example.reservationservice.services.Utils.*;

public class GetAvailableSlots
    implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {
  final public static String COLLECTION_NAME = "reservations";

  @Override
  public APIGatewayProxyResponseEvent handleRequest(
      APIGatewayProxyRequestEvent apiGatewayProxyRequestEvent, Context context) {
    APIGatewayProxyResponseEvent responseEvent = new APIGatewayProxyResponseEvent();
    LambdaLogger logger = context.getLogger();
    initialisation(context.getLogger());

    HashMap<String, String> headers = new HashMap<>();
    headers.put("Content-Type", "application/json");

    Map<String, String> queryParams = apiGatewayProxyRequestEvent.getQueryStringParameters();
    try {
      if (queryParams != null) {
        logger.log(queryParams.toString());
      }

      responseEvent.setBody(getGson().toJson(getAvailableSlots(queryParams, logger)));
      responseEvent.setStatusCode(200);
    } catch (Exception e) {
      responseEvent.setBody(e.getMessage());
      responseEvent.setStatusCode(404);
      throw new RuntimeException(e);
    }
    responseEvent.setHeaders(headers);
    return responseEvent;
  }

  public Collection<TimeSlot> getAvailableSlots(
      Map<String, String> queryParams, LambdaLogger logger) {
    try {
      List<TimeSlot> timeSlots =
          generateTimeSlots(queryParams.get("start"), queryParams.get("end"), 60);
      Map<String, TimeSlot> timeSlotHashMap = new LinkedHashMap<>();
      for (TimeSlot timeSlot : timeSlots) {
        timeSlot.setAvailable(true);
        timeSlotHashMap.put(timeSlot.toString(), timeSlot);
      }
      List<Reservation> reservations = getReservationsBasedOnCondition(queryParams, logger);
      logger.log("List of Reservations-> "+ reservations);
      if(reservations != null ){
        logger.log("List of Reservations not null");
        reservations.forEach(
                reservation -> {
                  if (timeSlotHashMap.containsKey(reservation.getTimeSlot().toString())) {
                    TimeSlot timeSlot = timeSlotHashMap.get(reservation.getTimeSlot().toString());
                    timeSlot.setAvailable(false);
                  }
                });
      }

      logger.log("available Time Slots");
      logger.log(timeSlotHashMap.toString());
      timeSlotHashMap.forEach(
          (s, timeSlot) -> {
            System.out.println(s + " isAvaialble ->  " + timeSlot.isAvailable());
          });
      return timeSlotHashMap.values();
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }

  public List<Reservation> getReservationsBasedOnCondition(
      Map<String, String> queryParams, LambdaLogger logger) throws Exception {
    List<Reservation> reservations = new LinkedList<>();
    Firestore firestore = FirestoreClient.getFirestore();
    CollectionReference collectionRef = firestore.collection(COLLECTION_NAME);
    Query query = null;
    if (queryParams != null) {
      String date = queryParams.get("date");
      String restaurantId = queryParams.get("restaurantId");
      String tableName = queryParams.get("tableName");
      String uid = queryParams.get("uid");
      logger.log(queryParams.toString());
      logger.log(queryParams.getOrDefault("isAcceptedByRestaurant", null));
      if (date != null && !date.equals("")) {
        query = collectionRef.whereEqualTo("date", date);
      }
      if (tableName != null && !tableName.equals("")) {
        if (query != null) {
          query = query.whereEqualTo("tableName", tableName);
        } else {
          query = collectionRef.whereEqualTo("tableName", restaurantId);
        }
      }
      if (restaurantId != null && !restaurantId.equals("")) {
        if (query != null) {
          query = query.whereEqualTo("restaurantId", restaurantId);
        } else {
          query = collectionRef.whereEqualTo("restaurantId", restaurantId);
        }
        logger.log("Setup completed for restaurantId");
      }
      if (uid != null && !uid.equals("")) {
        if (query != null) {
          query = query.whereEqualTo("uid", uid);
        } else {
          query = collectionRef.whereEqualTo("uid", uid);
        }
      }
      if (queryParams.getOrDefault("isAcceptedByRestaurant", null) != null) {
        boolean isAcceptedByRestaurant =
            Boolean.parseBoolean(queryParams.get("isAcceptedByRestaurant"));
        logger.log("isAcceptedByRes->" + isAcceptedByRestaurant);
        if (query != null) {
          query = query.whereEqualTo("acceptedByRestaurant", isAcceptedByRestaurant);
        } else {
          query = collectionRef.whereEqualTo("acceptedByRestaurant", isAcceptedByRestaurant);
        }
      }
    }
    ApiFuture<QuerySnapshot> querySnapshotApiFuture =
        query != null ? query.get() : collectionRef.get();
    System.out.println("Fetching the reservations.. line 130!");
    for (QueryDocumentSnapshot document : querySnapshotApiFuture.get().getDocuments()) {
      Reservation reservation = document.toObject(Reservation.class);
      System.out.println("Reservation->" + reservation);
      reservations.add(reservation);
    }
    return reservations;
  }
}