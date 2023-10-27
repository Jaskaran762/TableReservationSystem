package com.example.reservationservice.entity;

import com.google.cloud.Timestamp;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@AllArgsConstructor
@ToString
@NoArgsConstructor
public class Reservation {
    String userId;
    String restaurantId;
    String date;
    Timestamp startTime;
    Timestamp endTime;
    boolean isAcceptedByRestaurant;
    Integer numberOfPerson;
    boolean isDeleted;
}
