const { AuthenticationError } = require('apollo-server-express');
const jwt = require('jsonwebtoken');

// Set token secret and expiration date
const secret = 'mysecretsshhhhh';
const expiration = '2h';

module.exports = {
  // Function to sign a token for a user
  signToken: function ({ username, email, _id }) {
    const payload = { username, email, _id };
    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },

  // Function to verify the token and add user data to the context
  authMiddleware: function ({ req }) {
    // Extract token from request headers
    let token = req.headers.authorization;

    // Check if the token is provided
    if (token) {
      // Format the token if it starts with "Bearer"
      token = token.split(' ').pop().trim();
    } else {
      // If no token, return the request unchanged
      return req;
    }

    try {
      // Verify token and get user data out of it
      const { data } = jwt.verify(token, secret, { maxAge: expiration });
      // Attach user data to the request object
      req.user = data;
    } catch (error) {
      console.log('Invalid token');
      throw new AuthenticationError('Invalid token!');
    }

    // Return the request with user data attached
    return req;
  },
};
