const { Book, User } = require('../models');
const { signToken, AuthenticationError } = require('../utils/auth');
const fetch = (...args) => import('node-fetch').then(module => module.default(...args));


const searchGoogleBooks = async (query) => {
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error('Failed to fetch data from Google Books API');
    }
    return await response.json();
  };

const resolvers = {
    Query: {
        getSingleUser: async (parent, { userId }) => {
            const user = await User.findOne({ _id: userId });

            if (!user) {
                throw new Error("Could not find a user with this id!");
            }
            return user;
        },
        me: async (parent, args, context) => {
            if (context.user) {
              return User.findOne({ _id: context.user._id });
            }
            throw AuthenticationError;
          },
    },
    Mutation: {
        // Create a new user and return token
        addUser: async (parent, { username, email, password }) => {
            const user = await User.create({ username, email, password });
            const token = signToken(user);
            return { token, user };
        },

        // Log user in
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });

            if (!user) {
                throw new Error("Can't find this user");
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw new Error("Wrong password");
            }

            const token = signToken(user);
            return { token, user };
        },

        // Save a book to the user's savedBooks
        saveBook: async (parent, { bookData }, context) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $addToSet: { savedBooks: bookData } },
                    { new: true, runValidators: true }
                );

                return updatedUser;
            }

            throw AuthenticationError;
        },

        // Delete a book from the user's savedBooks
        removeBook: async (parent, { bookId }, context) => {
            if (context.user) {
              console.log("Authenticated user:", context.user._id);
              console.log("Removing book with ID:", bookId);
          
              const updatedUser = await User.findOneAndUpdate(
                { _id: context.user._id },
                { $pull: { savedBooks: { bookId } } },
                { new: true }
              );
          
              if (!updatedUser) {
                throw new Error("Couldn't find user with this ID!");
              }
          
              return updatedUser;
            }
          
            console.log("User not authenticated");
            throw new AuthenticationError("User not authenticated");
          },          
    },
};

module.exports = resolvers;