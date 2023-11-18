import json
import requests
from typing import Dict, Any

# Constants
API_URL_TEMPLATE = "https://{}.execute-api.us-east-1.amazonaws.com/dev{}"

GET_DATA_RESTAURANT = API_URL_TEMPLATE.format("4nghc9vm23", "/get-data-restaurant?id=1")
EDIT_DATA_RESTAURANT = API_URL_TEMPLATE.format("4nghc9vm23", "/edit-partner-detail")
RESERVATIONS_URL = API_URL_TEMPLATE.rsplit('/', 1)[0].format("zoonh4myj4") + "{}".format("/reservations")

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Main handler for AWS Lambda function responding to AWS Lex events.

    :param event: The event dictionary containing details from Lex.
    :param context: The context in which the Lambda function is called.
    :return: A response dictionary as per AWS Lex requirements.
    """
    print("Received event:", event)
    intent_name = event['interpretations'][0]['intent']['name']

    # Mapping of intent names to handler functions
    handlers = {
        "ManageOpeningTimes": handle_manage_opening_times,
        "ManageLocationInformation": handle_manage_location_information,
        "CheckReservationAvailability": handle_check_reservation_availability,
        "ReadReviews": handle_read_reviews,
        "ReadRestaurantRating": handle_read_restaurant_rating,
    }

    # Get the appropriate handler function based on the intent name
    handler = handlers.get(intent_name, handle_default)

    # Execute the handler function and return its response
    return handler(event)


def handle_manage_opening_times(event: Dict[str, Any]) -> Dict[str, Any]:
    action_type = get_slot_value(event, 'ActionType')

    if action_type == 'view':
        response = get_request(GET_DATA_RESTAURANT)
        if response:
            opening_time = response.get('openingTime')
            closing_time = response.get('closingTime')
            return build_response("ManageOpeningTimes", event, f"Opening hours are from {opening_time} to {closing_time}.")
        else:
            return build_response("ManageOpeningTimes", event, f"No information found.")
    elif action_type == 'update':
        opening_time = get_slot_value(event, 'OpeningTime')
        closing_time = get_slot_value(event, 'ClosingTime')

        payload = {
            "id": 1,
            "operation": "availability",
            "openingTime": opening_time,
            "closingTime": closing_time
        }

        response = post_request(EDIT_DATA_RESTAURANT, payload)
        if response == "Success":
            return build_response("ManageOpeningTimes", event, f"Opening and closing times updated successfully.")
        else:
            return build_response("ManageOpeningTimes", event, f"Falied to update opening and closing times.")
    else:
        return build_response("ManageOpeningTimes", event, "Sorry, I didn't understand that request.")


def handle_manage_location_information(event: Dict[str, Any]) -> Dict[str, Any]:
    action_type = get_slot_value(event, 'ActionType')

    if action_type == 'view':
        response = get_request(GET_DATA_RESTAURANT)
        if response:
            location = response.get('location')
            return build_response("ManageLocationInformation", event, f"The restaurant is located at {location}.")
        else:
            return build_response("ManageLocationInformation", event, f"No information found.")
    elif action_type == 'update':
        location = get_slot_value(event, 'Location')

        payload = {
            "id": 1,
            "operation": "location",
            "location": location
        }

        response = post_request(EDIT_DATA_RESTAURANT, payload)
        if response == "Success":
            return build_response("ManageLocationInformation", event, f"Location updated successfully.")
        else:
            return build_response("ManageLocationInformation", event, f"Falied to update location.")
    else:
        return build_response("ManageLocationInformation", event, "Sorry, I didn't understand that request.")


def handle_check_reservation_availability(event: Dict[str, Any]) -> Dict[str, Any]:
    input_date = get_slot_value(event, 'Date')

    response = get_request(RESERVATIONS_URL)
    if response:
        # Filter reservations by the input date
        reservations_for_date = [res for res in response if res.get('date') == input_date]

        if reservations_for_date:
            booked_slots = []
            for reservation in reservations_for_date:
                start_time = reservation.get("timeSlot", {}).get("start", "Unknown start time")
                end_time = reservation.get("timeSlot", {}).get("end", "Unknown end time")
                booked_slots.append(f"{start_time} to {end_time}")

            return build_response("CheckReservationAvailability", event, f"Booked time slots for {input_date} are: " + ", ".join(booked_slots))

        else:
            return build_response("CheckReservationAvailability", event, f"No reservations found for {input_date}.")
    else:
        return build_response("CheckReservationAvailability", event, "Failed to retrieve reservation data.")


def handle_read_reviews(event: Dict[str, Any]) -> Dict[str, Any]:
    response = get_request(GET_DATA_RESTAURANT)

    if response and "reviewList" in response and response["reviewList"]:
        # Sort reviews by review_id assuming it indicates recency (adjust if needed)
        latest_review = sorted(response["reviewList"], key=lambda x: x.get('review_id', 0), reverse=True)[0]
        review_author = latest_review.get("author", "Anonymous")
        review_rating = latest_review.get("rating", "No rating")
        review_description = latest_review.get("description", "No description provided.")

        return build_response("ReadReviews", event, f"Latest review by {review_author}: Rating - {review_rating}, Comment - '{review_description}'.")
    else:
        return build_response("ReadReviews", event, "Failed to retrieve reviews or no reviews available for this restaurant.")


def handle_read_restaurant_rating(event: Dict[str, Any]) -> Dict[str, Any]:
    response = get_request(GET_DATA_RESTAURANT)

    if response and "reviewList" in response:
        ratings = [review["rating"] for review in response["reviewList"] if "rating" in review]
        if ratings:
            average_rating = sum(map(int, ratings)) / len(ratings)
            return build_response("ReadRestaurantRating", event, f"The average rating for is {average_rating:.1f}.")
        else:
            return build_response("ReadRestaurantRating", event, f"No ratings available for restaurant.")
    else:
        return build_response("ReadRestaurantRating", event, "Failed to retrieve ratings.")




def handle_default(event: Dict[str, Any]) -> Dict[str, Any]:
    """
    Default handler for unhandled intents.

    :param event: The event dictionary from Lex.
    :return: A default response.
    """
    intent_name = event['interpretations'][0]['intent']['name']
    return build_response(intent_name, event, "Sorry, I didn't understand that request.")


# Add other helper functions like `build_response` and `post_request`...
def get_request(url: str) -> Dict[str, Any]:
    try:
        response = requests.get(url)
        return response.json()
    except requests.RequestException as e:
        print(f"Request failed: {e}")
        return {}


def post_request(url: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    try:
        response = requests.post(url, data=json.dumps(payload))
        return response.json()
    except requests.RequestException as e:
        print(f"Request failed: {e}")
        return {}


def get_slot_value(event: Dict[str, Any], slot_name: str) -> str:
    try:
        return event['interpretations'][0]['intent']['slots'][slot_name]['value']['originalValue']
    except KeyError:
        return ""


def build_response(intent_name: str, event: Dict[str, Any], message: str) -> Dict[str, Any]:
    return {
        "sessionState": {
            "dialogAction": {"type": "Close"},
            "intent": {
                'name': intent_name,
                'slots': event['interpretations'][0]['intent']['slots'],
                'state': 'Fulfilled'
            }
        },
        "messages": [{"contentType": "PlainText", "content": message}]
    }
