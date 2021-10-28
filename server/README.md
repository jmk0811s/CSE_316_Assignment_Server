This example was from: https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/mongoose 

Read the article series further to learn more about using MongoDB and Mongoose.

To populate the database

    node populatedb <your mongodb url>

For example, to use the URL listed in the project

    node populatedb mongodb://localhost:27017/LibraryExample

To run the backend server, type:

    node app.js

Try going to:

    http://localhost:3000/api/authors

    http://localhost:3000/api/authors/6056bb8551936fb5c67c6c93

    http://localhost:3000/api/books

    http://localhost:3000/api/bookinstances

You can also test posting to the api/authors route. Make a post request and set the Body to be Raw + JSON and copy the below text in:
   
    {
        "first_name": "Alice",
        "family_name": "Kim",
        "date_of_birth": "1988-12-20T00:00:00.000Z"
    }

