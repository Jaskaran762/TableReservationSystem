package com.example.reservationservice;

import com.google.gson.Gson;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.sqs.SqsClient;
import software.amazon.awssdk.services.sqs.model.SendMessageRequest;
import software.amazon.awssdk.services.sqs.model.SqsException;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SQSNotificationData {
    String date;
    String time;
    String type;
    String id;
    String subject;
    String from;
    String message;
    String restaurantId;

    String email;
    public static void sendNotification(SQSNotificationData sqsNotificationData){
        try{
            System.out.println("Seding messag-->!");
            System.out.println(sqsNotificationData.toString());
            SqsClient sqsClient = SqsClient.builder().region(Region.US_EAST_1).build();
            SendMessageRequest sendMessageRequest =
                    SendMessageRequest.builder()
                            .queueUrl("https://sqs.us-east-1.amazonaws.com/389834615459/notification-queue")
                            .messageBody(new Gson().toJson(sqsNotificationData))
                            .build();
            sqsClient.sendMessage(sendMessageRequest);
            System.out.println("The Message Has been sent!");
        }catch (SqsException sqsException){
      System.out.println("The Error Occured While sending sqs Notification!");
      System.out.println(sqsException.toString());
        }

    }
}
