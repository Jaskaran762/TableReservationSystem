package com.example.reservationservice;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.SQSEvent;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.core.SdkBytes;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.lambda.LambdaClient;
import software.amazon.awssdk.services.lambda.model.InvocationType;
import software.amazon.awssdk.services.lambda.model.InvokeRequest;
import software.amazon.awssdk.services.lambda.model.InvokeResponse;
import software.amazon.awssdk.services.scheduler.SchedulerClient;
import software.amazon.awssdk.services.scheduler.model.*;


import java.lang.reflect.Type;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

public class NotificationScheduler implements RequestHandler<SQSEvent,Object> {
    private static final String FUNCTION_NAME_TO_INVOKE = "emailSender";
    private static final Region REGION = Region.US_EAST_1;

    @Override
    public Object handleRequest(SQSEvent request, Context context) {
        context.getLogger().log("Current Request Body =>"+request);
        Type type = new TypeToken<HashMap<String, String>>() {}.getType();
        Map<String, String> body = new Gson().fromJson(request.getRecords().get(0).getBody(), type);
        context.getLogger().log("Current Request Body =>"+body);
        if(body != null){
            if(body.containsKey("type") && body.get("type").equals("REGULAR")){
                context.getLogger().log("Regular Message Came with-> ");
                context.getLogger().log(body.toString());
                callSendEmailLambdaFunction(body);
            }else if (body.containsKey("type") && body.get("type").equals("RESTAURANT-NOTIFIER")){
                System.out.println("RESTAURANT-NOTIFIER");
                System.out.println("Body->"+body);
                RestaurantNotificationSender restaurantNotificationSender = new RestaurantNotificationSender();
                restaurantNotificationSender.scheduleNotificationRegardingReservation(body.get("id"),body.get("email"));
            }
            else{
                SchedulerClient client = SchedulerClient.builder()
                        .credentialsProvider(DefaultCredentialsProvider.create())
                        .region(Region.US_EAST_1)
                        .build();
                createEventBridge(client,body);
            }
        }
        return null;
    }

    public void createEventBridge(SchedulerClient client, Map<String,String> body){
        if(
                body.containsKey("id") && body.containsKey("message")
                        && body.containsKey("email") && body.containsKey("from")
                && body.containsKey("date") && body.containsKey("time")
        ){
      try{
          deleteOldEventIfExist(client, body);
      }catch (ResourceNotFoundException e ){
      }
            if(body.get("type").equals("SCHEDULED")){
                body.put("type","REGULAR");
            }
            if(body.get("from").equals("RESTAURANT-NOTIFIER")){
                body.put("type","RESTAURANT-NOTIFIER");
            }
            CreateScheduleRequest createScheduleRequest = CreateScheduleRequest.builder()
                    .name(body.get("id")+body.get("from"))
                    .state(ScheduleState.ENABLED)
                    .scheduleExpressionTimezone("America/Halifax")
                    .flexibleTimeWindow(FlexibleTimeWindow.builder().mode("OFF").build())
                    .scheduleExpression("at("+body.get("date")+"T"+body.get("time")+")")
                    .target(software.amazon.awssdk.services.scheduler.model.Target.builder()
                            .arn("arn:aws:sqs:us-east-1:389834615459:notification-queue")
                            .roleArn("arn:aws:iam::389834615459:role/LabRole")
                            .input(new Gson().toJson(body))
                            .build())
                    .build();

            client.createSchedule(createScheduleRequest);
        }
    }
    public void deleteOldEventIfExist(SchedulerClient client, Map<String,String> body){
        if(body.containsKey("id") && body.containsKey("message") && body.containsKey("email") && body.containsKey("from")){
            if(checkNotificationAlreadyExistInEventBridge(client, body)){
                DeleteScheduleRequest deleteScheduleRequest = DeleteScheduleRequest.builder()
                        .name(body.get("id")+body.get("from")).build();
                client.deleteSchedule(deleteScheduleRequest);
            }
        }
    }
    public boolean checkNotificationAlreadyExistInEventBridge(SchedulerClient client,Map<String,String> body){
        if(body.containsKey("id") && body.containsKey("message") && body.containsKey("email") && body.containsKey("from")){
            GetScheduleRequest getScheduleRequest = GetScheduleRequest.builder()
                    .name(body.get("id")+body.get("from"))
                    .build();
            GetScheduleResponse  getScheduleResponse = client.getSchedule(getScheduleRequest);
            return getScheduleResponse.sdkHttpResponse().isSuccessful();
        }
        return false;
    }
    public String callSendEmailLambdaFunction(Map<String, String> body){
        LambdaClient lambdaClient = LambdaClient.builder().region(REGION).build();
        String bodyJSON = new Gson().toJson(body);
        InvokeRequest invokeRequest = InvokeRequest.builder()
                .functionName(FUNCTION_NAME_TO_INVOKE)
                .invocationType(InvocationType.REQUEST_RESPONSE)
                .payload(SdkBytes.fromByteArray(bodyJSON.toString().getBytes(StandardCharsets.UTF_8)))
                .build();

        try {
            InvokeResponse invokeResponse = lambdaClient.invoke(invokeRequest);

            String result = new String(invokeResponse.payload().asByteArray(), StandardCharsets.UTF_8);
            return result;
        } catch (Exception e) {
            System.err.println("Error invoking Lambda function: " + e.getMessage());
            return "Error invoking Lambda function.";
        } finally {
            lambdaClient.close();
        }
    }
}
