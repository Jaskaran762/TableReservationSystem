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
        booking_counts= table_bookings(documents)
        firebase_admin.delete_app(firebase_admin.get_app())

        return {
            'statusCode': 200,
            'header':{'Access-Control-Allow-Origin':'*',
                      'Content-Type':'application/json'},
            'body':  json.dumps(booking_counts, default=str)
            
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'body': f'Error: {str(e)}'
        }

def table_bookings(documents):
    booking_counts = defaultdict(lambda: defaultdict(lambda: defaultdict(lambda: defaultdict(int))))

    for doc in documents:
        data = doc.to_dict()
        date_str = data.get('date')
        restaurant_id = data.get('restaurantId')


        if date_str and restaurant_id:
            date_obj = datetime.strptime(date_str, "%Y-%m-%d")
            daily_key = date_obj.strftime("%Y-%m-%d")
            weekly_key = str(date_obj.isocalendar()[1])
            monthly_key = str(date_obj.month)

        
        time_slot = data.get('timeSlot')
        if time_slot:
            start_time = time_slot.get('start')
            end_time = time_slot.get('end')
            if start_time and end_time:
                time_interval_key = f"{start_time}-{end_time}"
                booking_counts[restaurant_id]['daily'][daily_key][time_interval_key] += 1
                booking_counts[restaurant_id]['weekly'][weekly_key][time_interval_key] += 1  
                booking_counts[restaurant_id]['monthly'][monthly_key][time_interval_key] += 1  

    return booking_counts

# def convert_keys(data):
#         return {str(key): value for key, value in data.items()}

# def main():
    
#     mock_event = {}
#     mock_context = {}
    
#     result = lambda_handler(mock_event, mock_context)
#     print(result)

# if __name__ == "__main__":
#     main()
