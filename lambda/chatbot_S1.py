import json
import random
import requests
from typing import Dict, Any

# Constants
API_URL_TEMPLATE = "https://{}.execute-api.us-east-1.amazonaws.com/dev{}"

GET_DATA_RESTAURANT = API_URL_TEMPLATE.format("4nghc9vm23", "/get-data-restaurant")
GET_MENU_RESTAURANT = API_URL_TEMPLATE.format("xf0lcrieqb", "/get-menu-restaurant")
GET_REVIEW_RESTAURANT = API_URL_TEMPLATE.format("wgfb53q6ie", "/get-review-restaturant")
ADD_REVIEW_RESTAURANT = API_URL_TEMPLATE.format("ch0bs0q5ek", "/add-review-restaurant")
RESERVATIONS_URL = API_URL_TEMPLATE.rsplit("/", 1)[0].format("zoonh4myj4", "/reservations")


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
        "AvailableRestaurantsIntent": handle_available_restaurants,
        "OpeningTimesIntent": handle_opening_times,
        "LocationInfoIntent": handle_location_info,
        "MenuAvailabilityIntent": handle_menu_availability,
        "RestaurantReviewIntent": handle_restaurant_review,
        "RestaurantRatingIntent": handle_restaurant_rating,
        "PushRestaurantRatingIntent": handle_push_restaurant_rating,
        "BookReservationIntent": handle_book_reservation,
        "MenuBookIntent": handle_menu_book
    }

    # Get the appropriate handler function based on the intent name
    handler = handlers.get(intent_name, handle_default)

    # Execute the handler function and return its response
    return handler(event)


def handle_available_restaurants(event: Dict[str, Any]) -> Dict[str, Any]:
    city = get_slot_value(event, 'city')
    if not city:
        return build_response("AvailableRestaurantsIntent", event, "Please specify a city.")

    payload = {"city": city}
    response = post_request(GET_DATA_RESTAURANT, payload)
    if not response or len(response.get('restaurants', [])) == 0:
        return build_response("AvailableRestaurantsIntent", event, f"No available restaurants found in {city}.")

    restaurant_names = [restaurant['name'] for restaurant in response['restaurants']]
    message = "Available restaurants in " + city + ": " + ', '.join(restaurant_names)
    return build_response("AvailableRestaurantsIntent", event, message)


def handle_opening_times(event: Dict[str, Any]) -> Dict[str, Any]:
    restaurant_name = get_slot_value(event, 'Restaurant_Name')
    if not restaurant_name:
        return build_response("OpeningTimesIntent", event, "Please specify a restaurant name.")

    payload = {"name": restaurant_name}
    response = post_request(GET_DATA_RESTAURANT, payload)
    if not response or len(response.get('restaurants', [])) != 1:
        return build_response("OpeningTimesIntent", event, f"No information found for {restaurant_name}.")

    opening_time = response['restaurants'][0]['openingTime']
    closing_time = response['restaurants'][0]['closingTime']
    message = f"{restaurant_name} opens at {opening_time} and closes at {closing_time}."
    return build_response("OpeningTimesIntent", event, message)


def handle_location_info(event: Dict[str, Any]) -> Dict[str, Any]:
    restaurant_name = get_slot_value(event, 'Restaurant_Name')
    if not restaurant_name:
        return build_response("LocationInfoIntent", event, "Please specify a restaurant name.")

    payload = {"name": restaurant_name}
    response = post_request(GET_DATA_RESTAURANT, payload)
    if not response or len(response.get('restaurants', [])) != 1:
        return build_response("LocationInfoIntent", event, f"No location information found for {restaurant_name}.")

    location = response['restaurants'][0]['location']
    message = f"{restaurant_name} is located at {location}."
    return build_response("LocationInfoIntent", event, message)


def handle_menu_availability(event: Dict[str, Any]) -> Dict[str, Any]:
    restaurant_name = get_slot_value(event, 'Restaurant_Name')
    if not restaurant_name:
        return build_response("MenuAvailabilityIntent", event, "Please specify a restaurant name.")

    payload = {"name": restaurant_name}
    response = post_request(GET_MENU_RESTAURANT, payload)
    if 'menus' not in response or not response['menus']:
        return build_response("MenuAvailabilityIntent", event, f"No menu information available for {restaurant_name}.")

    menu_items = ', '.join([menu['name'] for menu in response['menus']])
    message = f"{restaurant_name} offers the following dishes: {menu_items}"
    return build_response("MenuAvailabilityIntent", event, message)


def handle_restaurant_review(event: Dict[str, Any]) -> Dict[str, Any]:
    restaurant_name = get_slot_value(event, 'Restaurant_Name')
    if not restaurant_name:
        return build_response("RestaurantReviewIntent", event, "Please specify a restaurant name.")

    payload = {"name": restaurant_name}
    response = post_request(GET_REVIEW_RESTAURANT, payload)
    if not response or 'reviews' not in response or not response['reviews']:
        return build_response("RestaurantReviewIntent", event, f"No reviews found for {restaurant_name}.")

    reviews = response['reviews']
    random.shuffle(reviews)
    top_review = max(reviews, key=lambda r: int(r.get('rating', 0)))
    message = f"{restaurant_name} has a review: {top_review['description']}"
    return build_response("RestaurantReviewIntent", event, message)


def handle_restaurant_rating(event: Dict[str, Any]) -> Dict[str, Any]:
    restaurant_name = get_slot_value(event, 'Restaurant_Name')
    if not restaurant_name:
        return build_response("RestaurantRatingIntent", event, "Please specify a restaurant name.")

    payload = {"name": restaurant_name}
    response = post_request(GET_REVIEW_RESTAURANT, payload)
    if not response or 'reviews' not in response or not response['reviews']:
        return build_response("RestaurantRatingIntent", event, f"No ratings found for {restaurant_name}.")

    highest_rating = max(response['reviews'], key=lambda r: int(r['rating']))['rating']
    message = f"{restaurant_name} has a rating of {highest_rating}."
    return build_response("RestaurantRatingIntent", event, message)


def handle_push_restaurant_rating(event: Dict[str, Any]) -> Dict[str, Any]:
    restaurant_name = get_slot_value(event, 'Restaurant_Name')
    rating_number = get_slot_value(event, 'Rating_Number')
    customer_name = get_slot_value(event, 'Customer_Name')
    customer_review = get_slot_value(event, 'Customer_Review')

    if not restaurant_name or not rating_number or not customer_name or not customer_review:
        return build_response("PushRestaurantRatingIntent", event, "Please provide complete rating information.")

    payload = {
        "name": restaurant_name,
        "author": customer_name,
        "rating": rating_number,
        "description": customer_review
    }
    response = post_request(ADD_REVIEW_RESTAURANT, payload)

    if response.get('statusCode') == 200:
        message = "Review added successfully."
    else:
        message = "Failed to submit the review."

    return build_response("PushRestaurantRatingIntent", event, message)


def handle_book_reservation(event: Dict[str, Any]) -> Dict[str, Any]:
    restaurant_name = get_slot_value(event, 'Restaurant_Name')
    people_number = get_slot_value(event, 'Number_Of_People')
    start_time = get_slot_value(event, 'Time_Slot')

    if not restaurant_name or not people_number or not start_time:
        return build_response("BookReservationIntent", event, "Please provide complete reservation details.")

    payload = {
        "name": restaurant_name,
        "nop": people_number,
        "openingTime": start_time
    }
    response = post_request(RESERVATIONS_URL, payload)

    message = response.get('message', f"Failed to book a reservation at {restaurant_name}.")
    return build_response("BookReservationIntent", event, message)


def handle_menu_book(event: Dict[str, Any]) -> Dict[str, Any]:
    restaurant_name = get_slot_value(event, 'Restaurant_Name')
    dishes = get_slot_value(event, 'Dish')

    if not restaurant_name or not dishes:
        return build_response("MenuBookIntent", event, "Please specify the restaurant and dishes.")

    payload = {"name": restaurant_name, "dish": dishes}
    response = post_request(RESERVATIONS_URL, payload)

    message = response.get('message', f"Failed to pre-order dishes at {restaurant_name}.")
    return build_response("MenuBookIntent", event, message)


def handle_default(event: Dict[str, Any]) -> Dict[str, Any]:
    """
    Default handler for unhandled intents.

    :param event: The event dictionary from Lex.
    :return: A default response.
    """
    intent_name = event['interpretations'][0]['intent']['name']
    return build_response(intent_name, event, "Sorry, I didn't understand that request.")


# Add other helper functions like `build_response` and `post_request`...
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
