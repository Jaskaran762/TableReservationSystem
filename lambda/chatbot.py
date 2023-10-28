import json
import requests

def lambda_handler(event, context):
    print(event)
    intent_name = event['interpretations'][0]['intent']['name']

    if intent_name == "AvailableRestaurantsIntent":
        city = event['interpretations'][0]['intent']['slots']['city']['value']['originalValue']

        if city is not None or city != "":
            payload = {
                "city": city,
            }
        else:
            payload = {}

        response = requests.post("https://4nghc9vm23.execute-api.us-east-1.amazonaws.com/dev/get-data-restaurant", data=json.dumps(payload))
        restaurants = response.json()

        if len([restaurant['name'] for restaurant in restaurants['restaurants']]) != 0:
            message = "Here are the available restaurants: " + ', '.join([restaurant['name'] for restaurant in restaurants['restaurants']])
        else:
            message = "Unfortunaly, there are no available restaurants open in the given location " + city + "."


        return {
                    "sessionState": {
                        "dialogAction": {
                            "type": "Close"
                        },
                        "intent": {
                            'name': intent_name,
                            'slots': event['interpretations'][0]['intent']['slots'],
                            'state':'Fulfilled'

                            }
                    },
                    "messages": [
                        {
                            "contentType": "PlainText",
                            "content": message
                        }
                    ]
                }

    elif intent_name == "OpeningTimesIntent":
        restaurant_name = event['interpretations'][0]['intent']['slots']['Restaurant_Name']['value']['originalValue']

        if restaurant_name is not None or restaurant_name != "":
            payload = {
                "name": restaurant_name,
            }
        else:
            payload = {}

        response = requests.post("https://4nghc9vm23.execute-api.us-east-1.amazonaws.com/dev/get-data-restaurant", data=json.dumps(payload))
        restaurants = response.json()

        if len([restaurant['name'] for restaurant in restaurants['restaurants']]) == 1:
            opening_hour = [restaurant['openingTime'] for restaurant in restaurants['restaurants']]
            closing_hour = [restaurant['closingTime'] for restaurant in restaurants['restaurants']]

            message = restaurant_name + " opens at " + opening_hour[0] + " closes at " + closing_hour[0]
        else:
            message = "Unfortunaly, there are no available restaurant named " + restaurant_name + "."

        return {
                    "sessionState": {
                        "dialogAction": {
                            "type": "Close"
                        },
                        "intent": {
                            'name': intent_name,
                            'slots': event['interpretations'][0]['intent']['slots'],
                            'state':'Fulfilled'

                            }
                    },
                    "messages": [
                        {
                            "contentType": "PlainText",
                            "content": message
                        }
                    ]
                }

    elif intent_name == "LocationInfoIntent":
        restaurant_name = event['interpretations'][0]['intent']['slots']['Restaurant_Name']['value']['originalValue']

        if restaurant_name is not None or restaurant_name != "":
            payload = {
                "name": restaurant_name,
            }
        else:
            payload = {}

        response = requests.post("https://4nghc9vm23.execute-api.us-east-1.amazonaws.com/dev/get-data-restaurant", data=json.dumps(payload))
        restaurants = response.json()

        if len([restaurant['name'] for restaurant in restaurants['restaurants']]) == 1:
            location = [restaurant['location'] for restaurant in restaurants['restaurants']]

            message = restaurant_name + " is located at " + location[0] + "."
        else:
            message = "Unfortunaly, there are no available restaurant named " + restaurant_name + "."

        return {
                    "sessionState": {
                        "dialogAction": {
                            "type": "Close"
                        },
                        "intent": {
                            'name': intent_name,
                            'slots': event['interpretations'][0]['intent']['slots'],
                            'state':'Fulfilled'

                            }
                    },
                    "messages": [
                        {
                            "contentType": "PlainText",
                            "content": message
                        }
                    ]
                }

    elif intent_name == "MenuAvailabilityIntent":
        restaurant_name = event['interpretations'][0]['intent']['slots']['Restaurant_Name']['value']['originalValue']

        if restaurant_name is not None or restaurant_name != "":
            payload = {
                "name": restaurant_name,
            }
        else:
            payload = {}

        response = requests.post("https://xf0lcrieqb.execute-api.us-east-1.amazonaws.com/dev/get-menu-restaurant", data=json.dumps(payload))
        menu = response.json()

        try:
            if len(menu['menus']) != 1:
                message = restaurant_name + " is famous for " + ', '.join([menu['name'] for menu in menu['menus']]) + ". Want to try?"
        except KeyError:
            message = "Unfortunaly, there are no restaurant named " + restaurant_name + "."

        return {
                    "sessionState": {
                        "dialogAction": {
                            "type": "Close"
                        },
                        "intent": {
                            'name': intent_name,
                            'slots': event['interpretations'][0]['intent']['slots'],
                            'state':'Fulfilled'

                            }
                    },
                    "messages": [
                        {
                            "contentType": "PlainText",
                            "content": message
                        }
                    ]
                }

    elif intent_name == "RestaurantReviewIntent":
        restaurant_name = event['interpretations'][0]['intent']['slots']['Restaurant_Name']['value']['originalValue']

        if restaurant_name is not None or restaurant_name != "":
            payload = {
                "name": restaurant_name,
            }
        else:
            payload = {}

        response = requests.post("https://wgfb53q6ie.execute-api.us-east-1.amazonaws.com/dev/get-review-restaturant", data=json.dumps(payload))
        review = response.json()

        try:
            if len(review['reviews']) != 1:
                rating = [int(i['rating']) for i in review['reviews']]
                description = [i['description'] for i in review['reviews']]

                message = restaurant_name + " has a " + review['reviews'][rating.index(max(rating))]['description'] + "."
        except KeyError:
            message = "Unfortunaly, there are no restaurant named " + restaurant_name + "."

        return {
                    "sessionState": {
                        "dialogAction": {
                            "type": "Close"
                        },
                        "intent": {
                            'name': intent_name,
                            'slots': event['interpretations'][0]['intent']['slots'],
                            'state':'Fulfilled'

                            }
                    },
                    "messages": [
                        {
                            "contentType": "PlainText",
                            "content": message
                        }
                    ]
                }

    elif intent_name == "RestaurantRatingIntent":
        restaurant_name = event['interpretations'][0]['intent']['slots']['Restaurant_Name']['value']['originalValue']

        if restaurant_name is not None or restaurant_name != "":
            payload = {
                "name": restaurant_name,
            }
        else:
            payload = {}

        response = requests.post("https://wgfb53q6ie.execute-api.us-east-1.amazonaws.com/dev/get-review-restaturant", data=json.dumps(payload))
        review = response.json()

        try:
            if len(review['reviews']) != 1:
                rating = [int(i['rating']) for i in review['reviews']]

                message = restaurant_name + " has a " + str(review['reviews'][rating.index(max(rating))]['rating']) + "rating."
        except KeyError:
            message = "Unfortunaly, there are no restaurant named " + restaurant_name + "."

        return {
                    "sessionState": {
                        "dialogAction": {
                            "type": "Close"
                        },
                        "intent": {
                            'name': intent_name,
                            'slots': event['interpretations'][0]['intent']['slots'],
                            'state':'Fulfilled'

                            }
                    },
                    "messages": [
                        {
                            "contentType": "PlainText",
                            "content": message
                        }
                    ]
                }

    elif intent_name == "PushRestaurantRatingIntent":
        restaurant_name = event['interpretations'][0]['intent']['slots']['Restaurant_Name']['value']['originalValue']
        rating_number = event['interpretations'][0]['intent']['slots']['Rating_Number']['value']['originalValue']
        customer_name = event['interpretations'][0]['intent']['slots']['Customer_Name']['value']['originalValue']
        customer_review = event['interpretations'][0]['intent']['slots']['Customer_Review']['value']['originalValue']

        if restaurant_name is not None or restaurant_name != "":
            payload = {
                "name": restaurant_name,
                "author": customer_name,
                "rating": rating_number,
                "description": customer_review
            }
        else:
            payload = {}

        response = requests.post("https://ch0bs0q5ek.execute-api.us-east-1.amazonaws.com/dev/add-review-restaurant", data=json.dumps(payload))
        rating = response.json()

        # if rating['statusCode'] == 200:
        message = rating['body']['message']

        return {
                    "sessionState": {
                        "dialogAction": {
                            "type": "Close"
                        },
                        "intent": {
                            'name': intent_name,
                            'slots': event['interpretations'][0]['intent']['slots'],
                            'state':'Fulfilled'

                            }
                    },
                    "messages": [
                        {
                            "contentType": "PlainText",
                            "content": message
                        }
                    ]
                }

    elif intent_name == "BookReservationIntent":
        restaurant_name = event['interpretations'][0]['intent']['slots']['Restaurant_Name']['value']['originalValue']
        people_number = event['interpretations'][0]['intent']['slots']['Number_Of_People']['value']['originalValue']
        start_time = event['interpretations'][0]['intent']['slots']['Time_Slot']['value']['originalValue']

        if restaurant_name is not None or restaurant_name != "":
            payload = {
                "name": restaurant_name,
                "nop": people_number,
                "openingTime": start_time
            }
        else:
            payload = {}

        response = requests.post("https://zoonh4myj4.execute-api.us-east-1.amazonaws.com/reservations", data=json.dumps(payload))
        reservation = response.json()

        if len(reservation['message']) != 0:
            message = "Your reservation for " + people_number + " people in " + restaurant_name + " restaturant from " + start_time + " is booked."

        return {
                    "sessionState": {
                        "dialogAction": {
                            "type": "Close"
                        },
                        "intent": {
                            'name': intent_name,
                            'slots': event['interpretations'][0]['intent']['slots'],
                            'state':'Fulfilled'

                            }
                    },
                    "messages": [
                        {
                            "contentType": "PlainText",
                            "content": message
                        }
                    ]
                }

    elif intent_name == "MenuBookIntent":
        restaurant_name = event['interpretations'][0]['intent']['slots']['Restaurant_Name']['value']['originalValue']
        dishes = event['interpretations'][0]['intent']['slots']['Dish']['value']['originalValue']

        if restaurant_name is not None or restaurant_name != "":
            payload = {
                "name": restaurant_name,
                "dish": dishes
            }
        else:
            payload = {}

        response = requests.post("https://zoonh4myj4.execute-api.us-east-1.amazonaws.com/reservations", data=json.dumps(payload))
        reservation = response.json()

        if len(reservation['message']) != 0:
            message = "Your reservation at " + restaurant_name + " with pre-order of " + dishes + " is booked."

        return {
                    "sessionState": {
                        "dialogAction": {
                            "type": "Close"
                        },
                        "intent": {
                            'name': intent_name,
                            'slots': event['interpretations'][0]['intent']['slots'],
                            'state':'Fulfilled'

                            }
                    },
                    "messages": [
                        {
                            "contentType": "PlainText",
                            "content": message
                        }
                    ]
                }

    else:
                return {
                    "sessionState": {
                        "dialogAction": {
                            "type": "Close"
                        },
                        "intent": {
                            'name': intent_name,
                            'slots': event['interpretations'][0]['intent']['slots'],
                            'state':'Fulfilled'

                            }
                    },
                    "messages": [
                        {
                            "contentType": "PlainText",
                            "content": "IN ELSE"
                        }
                    ]
                }
