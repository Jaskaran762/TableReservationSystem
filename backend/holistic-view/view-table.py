import json
import firebase_admin
from firebase_admin import credentials,firestore
#from google.cloud import firestore
from firebase_admin import firestore
from datetime import datetime
from collections import defaultdict
import boto3

def lambda_handler(event, context):
    secret_name = "firebaseCredentials"  
    region_name = "us-east-1"

    session = boto3.session.Session()
    client = session.client(
        service_name='secretsmanager',
        region_name=region_name
    )

    try:
        response = client.get_secret_value(SecretId=secret_name)
        firebase_cred_json = response['SecretString']
        # firebase_cred_json = 'C:/Users/AVuser/Downloads/restaurant-reservation-bb560-firebase-adminsdk-brusl-24c6b59ef4.json'

        firebase_cred = json.loads(firebase_cred_json)

        cred = credentials.Certificate(firebase_cred)
        firebase_admin.initialize_app(cred)

        db = firestore.client()
        collection_ref = db.collection('reservations')
        documents = collection_ref.stream()
        daily, weekly, monthly, time_intervals= aggregate_table_bookings(documents)
        daily = convert_keys(daily)
        weekly = convert_keys(weekly)
        monthly = convert_keys(monthly)
        time_intervals = convert_keys(time_intervals)
        
        
        firebase_admin.delete_app(firebase_admin.get_app())

        return {
            'statusCode': 200,
            'body':  {
            'daily': daily,
            'weekly': weekly,
            'monthly': monthly,
            'time_intervals': time_intervals
        }
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'body': f'Error: {str(e)}'
        }

def aggregate_table_bookings(documents):
    daily_counts = defaultdict(int)
    weekly_counts = defaultdict(int)
    monthly_counts = defaultdict(int)
    time_interval_counts = defaultdict(int)

    for doc in documents:
        data = doc.to_dict()
        date_str = data['date']
        if date_str is not None:
            date_obj = datetime.strptime(date_str, "%Y-%m-%d") 

        # Increment table count
        key = (data['restaurantId'], data['tableName'])
        daily_counts[(date_obj.date(), key)] += 1
        weekly_counts[(date_obj.isocalendar()[1], key)] += 1
        monthly_counts[(date_obj.month, key)] += 1

        time_slot = data.get('timeSlot')
        if time_slot:
            start_time = time_slot.get('start')
            end_time = time_slot.get('end')
            if start_time and end_time:
                time_key = (start_time, end_time, key)
                time_interval_counts[time_key] += 1

    return daily_counts, weekly_counts, monthly_counts, time_interval_counts

def convert_keys(data):
        return {str(key): value for key, value in data.items()}

# def main():
    
#     mock_event = {}
#     mock_context = {}
    
#     result = lambda_handler(mock_event, mock_context)
#     print(result)

# if __name__ == "__main__":
#     main()
