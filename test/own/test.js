const chai = require('chai');
const expect = chai.expect;

const {
  registerUser,
  deleteUser
} = require('../../controllers/users');

const User = require('../../models/user');

// Get products (create copies for test isolation)
const products = require('../../products.json').map(product => ({ ...product }));

// Get users (create copies for test isolation)
const users = require('../../setup/users.json').map(user => ({ ...user }));

const adminUser = { ...users.find(u => u.role === 'admin') };
const customerUser = { ...users.find(u => u.role === 'customer') };

describe('User endpoints', () => {
  let response;
     it('User should be an object', async () => {
          console.log("HAHa");
      });

     it('Get current user', async () => {
          console.log("HAHA");
      });

      it('Get user role', async () => {
          console.log("HAHA");
      });

     it('Delete User', async () => {
          console.log("HAHA");
        
     });

     it('Get single user', async () => {
          console.log("HAHA");
     });

          
     it('Email Test', async () => {
          console.log("HAHA");
        
     });

     it('Password Test', async () => {
          console.log("HAHA");
        
     });
  });

// Products endpoints
describe('Viewing all products: GET /api/products', () => {
  it('As a customer, I want to see a list of products available.', async () => {
        console.log("HAHA");
   });
});

// A product endpoints
describe('Viewing a product: GET /api/products/{id}', () => {
  it('As a customer, I want to see the price of the product.', async () => {
        console.log("HAHA");
  });
});

// A cart endpoints
describe('Adding a product to cart: POST /api/cart/{id}', () => {
  it('As a customer, I want to add items to the cart.', async () => {
        console.log("HAHA");
  });

  it('As a customer, I want to remove a product from the cart.', async () => {
        console.log("HAHA");
  });
});
