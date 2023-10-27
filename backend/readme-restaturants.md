https://j7fjhegj3f.execute-api.us-east-1.amazonaws.com/default/get-data-restaurant
Request
{
"city": "Toronto"  // city of restaurant  ---optional paramneter
"rating": "2"     // minimum rating required for restaurant  ---optional paramneter
"availability": true  // filter restaurants to show only available restaturants ---optional paramneter
}
OR
{
"name": "Toronto"  //name of restaurant ---optional parameter, if empty body then all restaurants will               be displayed
}
https://my8t0lawo1.execute-api.us-east-1.amazonaws.com/default/get-menu-restaurant
{
"name": "Dhaba"
}
https://wmv55gt9tl.execute-api.us-east-1.amazonaws.com/default/get-review-restaturant
{
"name": "Dhaba"
}
https://bw9cets0al.execute-api.us-east-1.amazonaws.com/default/add-review-restaurant
{
"name": "Dhaba",
"author": "Gauri",
"rating": "3",
"description": "very bad food"
}