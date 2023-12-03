const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccount.json');
const AWS = require("aws-sdk");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

exports.handler = async (event, context, callback) => {
  
  console.log("event", event);
  console.log(event.Records[0].dynamodb);
  
  const newImages = event.Records.map(
            (record) => AWS.DynamoDB.Converter.unmarshall(record.dynamodb.NewImage)
    );
    
  console.log(newImages);
  
  const oldRestaurantName = event.Records[0].dynamodb.OldImage.name.S;
  const restaurantName = newImages[0].name;
  
  console.log(restaurantName);
  // Do whatever you want to do with Firestore
  const firebaseFirestore = admin.firestore();

  // Check if the "restaurants" collection already exists
  const restaurantsCollection = firebaseFirestore.collection('restaurants');
  
  
   try {
    // Check if a document for the restaurant already exists and delete it
    const res = await restaurantsCollection.doc(oldRestaurantName).delete();


    // Sample data for the new restaurant
    const newRestaurantData = newImages[0];

    // Add a new document for the restaurant to the "restaurants" collection
    const newRestaurantDocRef = await restaurantsCollection.doc(restaurantName).set(newRestaurantData);
    console.log('New restaurant document added with ID:', newRestaurantDocRef.id);

  } catch (error) {
    console.error('Error processing restaurant:', error);
  }
}
