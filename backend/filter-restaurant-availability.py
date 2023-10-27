import json
import boto3
from datetime import datetime, time, timedelta, timezone

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('Restaurant')  # Replace with your actual table name

def lambda_handler(event, context):
    current_time = get_current_time(event)
    
    response = event
    print(event)
    # Filter restaurants based on availability
    filtered_restaurants = []
    for item in response.get('Items', []):
        opening_time = parse_time(item.get('openingTime', '00:00'))
        closing_time = parse_time(item.get('closingTime', '23:59'))
        if is_within_working_hours(current_time, opening_time, closing_time):
            filtered_restaurants.append(item)

    print(filtered_restaurants)
    
    result = {}
    result = {'Items': filtered_restaurants, 'Count': len(filtered_restaurants)}
    print(result)
    return json.dumps(result)

# Helper function to get the current time in the restaurant's timezone
def get_current_time(event):
    current_time_utc = datetime.utcnow()
    restaurant_timezone = timezone(timedelta(hours=-4))  # Atlantic Standard Time (AST) offset
    current_time = current_time_utc.astimezone(restaurant_timezone)
    return current_time.time()

# Helper function to parse time from string
def parse_time(time_str):
    return datetime.strptime(time_str, '%H:%M').time()

# Helper function to check if the current time is within working hours
def is_within_working_hours(current_time, opening_time, closing_time):
    print(current_time)
    print(opening_time)
    print(closing_time)
    return opening_time <= current_time <= closing_time
