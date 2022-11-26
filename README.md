# Welcome to Webdev1 group work repository

This is the main repository of our group work's project. We created a web shop application after roughly a month.

# Group information: Member and workshare

Member1:  Thuy Le, thuy.t.le@tuni.fi, 150533634, 
resposible for:
  1. **8.4.1 User Registration**: Updating new user registration and update the registration form.
  2. **8.5 User Authentication**: Handling the Authentication header from the requests. Server send back correct Basic Authorization Challenge when the Authentication header is incorrect.
  3. **8.6 Modifying and Deleting Users**: Updating user information and delete users from the database (if the role of current user is Admin).
  4. Setting up MongoDB:
     - **9.4 Connect URL and its secure handling**: setting up the `.env` file to run MongoDB Connect URL.
     - **9.5 Mongoose Schema**: Defining the Mongoose Schema `User` for the users of the application.
     - **9.6 Modifying Application to Use Database**: Making sure that the app can use the newly created database in MongoDB, together with Anh Phan.
  5. **10.4 MVC**: Refactoring application using controllers files.
  6. **10.6.1 Functional Programming**: Fixing our code so that it doesn't use any form of `for-` or `while-` loop.
  7. **11.2.1 Mocha grader**: Fixing our code so that it can pass the Mocha tests.
  8. **11.2.2 JSDoc Grader**: Commenting the codes with JSDoc, so that the structure is clear.
  9. **11.2.4 ESLint Grader** and **11.2.5 ESLint with functional programming grader**: Using ESLint to make sure that our code base meets the coding conventions.

Member2:  Anh Phan, anh.phan@tuni.fi, 150542094, 
resposible for: 
  1. **8.7 Hello ESLint!**: Fixing codes according to ESLint conventions.
  2. **9.2 Session storage**: Front to backend communication between client and server. Updating the GUI based on user's action. Saving user's Cart into the SessionStorage.
  3. **10.2 MVC**: Creating user stories as GitLab issues together with Thuy Le.
  4. **10.3 MVC**: Creating corresponding simple Mocha test cases with placeholders for GitLab issues.
  5. **10.5 Setting up and using the GitLab CI pipeline**: Setting up the Gitlab CI Pipeline for automate testing.
  6. Making documents required for the project.  
  7. Updating the `README.md`to document the project.

## Node project structure

The structure of project follows the Model-View-Controller (MVC) architecture:
- Model: Including `user`, `product`, and `order` models. These models work under the MongoDB's database model `db`.
- Controller: The controllers that control the data models including `./controllers/users.js` and `./controllers/products.js`. Moreover, we also have the `./routes.js` controller to control the routing and handle user's request. And `./auth/auth.js` to check user's authentication.
- View: The UI of the service is control by the files in `./public/js/*.js`, including updating and registering users, updating the shopping cart, and displaying the available products of the service.

The **sequence diagram** of our app: `./sequence-diagram.png`

## Pages and navigation

The **navigation diagram** of our web site: `./navigation-diagram.jpg`

## Data models

This project uses MongoDB for its database, and we created 3 Data Model Schemas for **User**, **Product**, and **Order**. These schemas define and validate the structure of the data during updates and insertions.

**User**: Data model for all the users of the service. Using this data model, user can register to the service, update their information, and login. All the users of the service can be view in the `List Users` page of the service. The data model for the user contains these attributes:

- `name`: String. Name of the user,
- `email`: String. Email of the user,
- `password`: String. Password of the user,
- `role`: String. Role of the user which is either `customer`(the default role) or `admin`.

Each user is assigned a unique ID by MongoDB. This ID can be used to find user and find orders placed by that user.

**Product**: Data model for all the products listed on the `List Products` page of the service. The data model for the product contains these attributes:

- `name`: String. Name of the product,
- `description`: String. Description of the product,
- `price`: Number. Price of the product,
- `image`: String. The image URL of the product

Each product is assigned a unique ID by MongoDB. This ID can be used to find the product and make sure that the product data is consistent with the frontend products displayed.

**Order**: Data model for an order made by an user of the service. The data model for the product contains these attributes:

- `customerId`: mongoose.ObjectID. The ID of the customer that made this order.
- `items`: Array. The items that order contains. This array stores multiple `item`s that has the following attributes:
    - `product`: Schema.Types.Mixed. The product that this item represents.
    - `quantity`: Number. The quantity of this item in the order.

The `Order`data model can be used to track the orders that have been placed by a given `User`. The orders can be found using the `customerID`field.

## Tests and documentation

We used our self-defined tests and the provided Mocha tests to test all the functions of the website.

A table of our Gitlab's issues listed with their associated Mocha tests and test files: `./test-issue.png`

## Security concerns

Our application is vulnerable to the following security threats:

- Cross-Site Scripting (XSS)
- Session hijacking
- Cross-Site Request Forgery
- SQL injection
- Directory traversal

And we did several things to mitigate them:
- Validate user's input data patterns
- Using HTTP Authentication Header and Basic Authentication Challenge to check user's credentials.
- Using Role-based access control by assigning each user a role (either `customer` or `admin`, only `admin` users can modify the server database).
- Define allowed methods in the request file path, so that no unauthorized methods can be performed.
- User's password is at least 10 characteres and is encrypted at the time of setting it (before it is saved to the database). Password encryption is done with bcryptjs.

## Finalization

This course is very challenging for us, but we also have learned a lot throughout the process. With the project completed, we have created an MVC Web App. There was lots of work. Having to handle routings, security, data persistence, and UI controlling sometimes without a clear instruction is very hard, confusing and frustrating. But now we understand how those process are handled and what to keep in mind when tackling these problems.


To run the test, please do the following steps:
1. Navigate to the project's directory and run:
```
$ npm install
```
to install the dependencies defied in the `package.json` files. You do not need to install any new libraries yourself.

2. Now you can run these commands to test our code:

```
$ npm test               // Run Mocha tests
$ npm run jsdoc-lint     // Test for JSDoc documentations
$ npx eslint             // Test with ESLint to check for coding conventions
$ npm run fp-lint        // Test for functional programming conventions    

_Good luck and happy group workin'!_
