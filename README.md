# Changing-Lives-API
Changing Lives API repository

#### Running development
To install dependencies `npm install`

To run auto-restarting project builder `npm start`

#### html and pug files
If you create a html file inside of the 'site' folder, create a pug file in the views folder by the same name but with extension .pug and inside the pug file write an include for the html file'

#### Creating a get/post route
In the api file (or files within the api file) create a js file for the route, clone the example.js route if you need to. In app.js, create a constant that points to this new file and near the bottom of app.js direct the file to a specific route.