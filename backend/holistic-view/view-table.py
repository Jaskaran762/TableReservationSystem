import json
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime
from collections import defaultdict
import boto3

def lambda_handler(event, context):
    # Define the secret name and AWS region for retrieving Firebase credentials
    secret_name = "firebaseCredentials"  
    region_name = "us-east-1"

    # Create a new AWS session and a client for the Secrets Manager service
    session = boto3.session.Session()
    client = session.client(service_name='secretsmanager', region_name=region_name)

    try:
        # Retrieve the secret containing Firebase credentials
        response = client.get_secret_value(SecretId=secret_name)
        firebase_cred_json = response['SecretString']

        # Convert the retrieved secret string to a dictionary
        firebase_cred = json.loads(firebase_cred_json)

        # Create Firebase credentials and initialize the Firebase app
        cred = credentials.Certificate(firebase_cred)
        firebase_admin.initialize_app(cred)

        # Connect to Firestore and retrieve 'reservations' collection
        db = firestore.client()
        collection_ref = db.collection('reservations')
        documents = collection_ref.stream()

        # Process documents to count bookings
        booking_counts = table_bookings(documents)

        # Delete the Firebase app instance
        firebase_admin.delete_app(firebase_admin.get_app())

        # Return the booking counts as a JSON response
        return {
            'statusCode': 200,
            'header': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps(booking_counts, default=str)
        }

    except Exception as e:
        # Handle exceptions and return an error response
        return {
            'statusCode': 500,
            'body': f'Error: {str(e)}'
        }

def table_bookings(documents):
    # Initialize a nested defaultdict to store booking counts
    booking_counts = defaultdict(lambda: defaultdict(lambda: defaultdict(lambda: defaultdict(int))))

    for doc in documents:
        # Convert each document to a dictionary
        data = doc.to_dict()
        date_str = data.get('date')
        restaurant_id = data.get('restaurantId')

        # Process date and restaurant ID
        if date_str and restaurant_id:
            date_obj = datetime.strptime(date_str, "%Y-%m-%d")
            daily_key = date_obj.strftime("%Y-%m-%d")
            weekly_key = str(date_obj.isocalendar()[1])
            monthly_key = str(date_obj.month)

        # Process time slot information
        time_slot = data.get('timeSlot')
        if time_slot:
            start_time = time_slot.get('start')
            end_time = time_slot.get('end')
            if start_time and end_time:
                # Create a key for the time interval and update booking counts
                time_interval_key = f"{start_time}-{end_time}"
                booking_counts[restaurant_id]['daily'][daily_key][time_interval_key] += 1
                booking_counts[restaurant_id]['weekly'][weekly_key][time_interval_key] += 1  
                booking_counts[restaurant_id]['monthly'][monthly_key][time_interval_key] += 1  

    return booking_counts
