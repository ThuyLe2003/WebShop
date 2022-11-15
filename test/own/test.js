const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');

chai.use(chaiHttp);

describe('Routes', () => {
  let allUsers;

  beforeEach(async () => {
    await User.deleteMany({});
    await User.create(users);
    allUsers = await User.find({});
  });

  describe('handleRequest()', () => {
    describe('Registration: POST /api/register', () => {
      it('As a user, I want to register to the system.', async () => {
        throw 'Not implemented';
      });
    });

    describe('Viewing all users: GET /api/users', () => {
      it('As an admin, I want to see the list of the users.', async () => {
        throw 'Not implemented';
      });
    });

    describe('Viewing a single user: GET /api/users/{id}', () => {
      it('As a user, I want to see the user view.', async () => {
        throw 'Not implemented';
        });
    });

    describe('Updating users: PUT /api/users/{id}', () => {
      it('As an admin, I want to change the role of a single user', async () => {
        throw 'Not implemented';
      });

      it('As a user, I want to update my own data.', async () => {
        throw 'Not implemented';
      });
    });

    describe('Deleting users: DELETE /api/users/{id}', () => {
      it('As an admin, I want to delete a single user.', async () => {
        throw 'Not implemented';
      });
    });
    });

  // Products endpoints
  describe('Viewing all products: GET /api/products', () => {
    it('As a customer, I want to see a list of products available.', async () => {
        throw 'Not implemented';
    });
  });

  // A product endpoints
  describe('Viewing a product: GET /api/products/{id}', () => {
    it('As a customer, I want to see the price of the product.', async () => {
        throw 'Not implemented';
    });
  });

  // A cart endpoints
  describe('Adding a product to cart: POST /api/cart/{id}', () => {
    it('As a customer, I want to add items to the cart.', async () => {
        throw 'Not implemented';
    });

    it('As a customer, I want to remove a product from the cart.', async () => {
        throw 'Not implemented';
    });
  });


});
