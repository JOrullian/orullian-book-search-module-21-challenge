const { deleteBook } = require('../controllers/user-controller');
const { Book, User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        getSingleUser: async (parent, { userId }) => {
            const user = await User.findOne({ _id: userId });

            if (!user) {
                throw new Error("Could not find a user with this id!");
            }
            return user;
        },
    },
    Mutation: {
        // Create a new user and return token
        createUser: async (parent, { username, email, password }) => {
            const user = await User.create({ name, email, password });
            const token = signToken(user);
            return { token, user };
        },

        // Log user in
        login: async (parent, { username, email, password }) => {
            const user = await User.findOne({
                $or: [{ email }, { username }],
            });

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

            throw new AuthenticationError("You need to be logged in!");
        },

        // Delete a book from the user's savedBooks
        deleteBook: async (parent, { bookId }, context) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId } } },
                    { new: true }
                )

                if (!updatedUser) {
                    throw new Error("Couldn't find user with this ID!");
                }

                return updatedUser;
            }

            throw new AuthenticationError("You need to be logged in!");
        },
    },
};

module.exports = resolvers;