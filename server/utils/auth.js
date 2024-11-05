const { GraphQLError } = require('graphql');
const jwt = require('jsonwebtoken');

// Set token secret and expiration date
const secret = 'mysecretsshhhhh';
const expiration = '2h';

module.exports = {
  AuthenticationError: new GraphQLError('Could not authenticate user.', {
    extensions: {
      code: 'UNAUTHENTICATED',
    },
  }),

  // Function to verify the token and add user data to the context
  authMiddleware: function ({ req }) {
    // Extract token from request headers
    let token = req.body.token || req.query.token || req.headers.authorization;

    console.log('Recieved token:', token)

    // We split the token string into an array and return actual token
    if (req.headers.authorization) {
      token = token.split(' ').pop().trim();
    }

    if (!token) {
      return req;
    }


    try {
      // Verify token and get user data out of it
      const { data } = jwt.verify(token, secret, { maxAge: expiration });
      // Attach user data to the request object
      req.user = data;
    } catch (error) {
      console.log('Invalid token');
      throw new GraphQLError('Invalid token!');
    }

    // Return the request with user data attached
    return req;
  },

    // Function to sign a token for a user
    signToken: function ({ username, email, _id }) {
      const payload = { username, email, _id };
      return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
    },
};
