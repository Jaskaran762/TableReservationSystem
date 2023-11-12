package com.example.reservationservice.dto;

import com.example.reservationservice.entity.TimeSlot;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@AllArgsConstructor
@ToString
@NoArgsConstructor
public class ReservationDTO {
    String documentId;
    String userId;
    String restaurantId;
    String date;
    String tableName;
    TimeSlot timeSlot;
    boolean isAcceptedByRestaurant;
    Integer numberOfPerson;
    boolean isDeleted;
}
