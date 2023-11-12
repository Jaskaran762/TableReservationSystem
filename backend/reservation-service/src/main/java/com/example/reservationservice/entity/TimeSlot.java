package com.example.reservationservice.entity;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class TimeSlot {
    private String start;
    private String end;
    private boolean isAvailable;

    @Override
    public String toString() {
        return "TimeSlot{" +
                "start='" + start + '\'' +
                ", end='" + end + '\'' +
                '}';
    }
}
