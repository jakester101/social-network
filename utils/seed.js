const connection = require('../config/connection');
const { User, Thought } = require('../models');

// Start the seeding runtime timer
console.time('seeding');

// Creates a connection to mongodb
connection.once('open', async () => {
  // Delete the entries in the collection
  await User.deleteMany({});
  await Thought.deleteMany({});

  // Empty arrays for randomly generated users and thoughts
  const thoughts = [];
  const users = [];

  // Function to make a user object and push it into the users array
  const makeUser = () => {
    const username = 'user' + Math.floor(Math.random() * 1000);
    const email = username + '@example.com';

    users.push({
      username,
      email,
    });
  };

  // Create 20 random users and push them into the users array
  for (let i = 0; i < 20; i++) {
    makeUser();
  }

  // Wait for the users to be inserted into the database
  await User.collection.insertMany(users);

  // Function to make a thought object and push it into the thoughts array
  const makeThought = (userId) => {
    const thought = new Thought({
      thoughtText: 'Thought ' + Math.floor(Math.random() * 1000),
      username: users.find((user) => user._id === userId).username,
    });
    thoughts.push(thought);
    const updatedUser = User.findOneAndUpdate(
      { _id: userId },
      { $push: { thoughts: thought._id } },
      { new: true }
    );
    return updatedUser;
  };

  // For each user, create 5 thoughts and push them into the thoughts array
  for (let i = 0; i < users.length; i++) {
    for (let j = 0; j < 5; j++) {
      makeThought(users[i]._id);
    }
  }

  // Add friends to users
  for (let i = 0; i < users.length; i++) {
    const friendUsernames = users.map((user) => user.username).filter((username) => username !== users[i].username);
    const user = await User.findOneAndUpdate(
      { username: users[i].username },
      { $push: { friends: { $each: friendUsernames.slice(0, 3).map((username) => users.find((user) => user.username === username)._id) } } },
      { new: true }
    );
  }

  // Log out a pretty table for thoughts and users, excluding the excessively long thoughtText property
  console.table(thoughts, ['username', '_id']);
  console.table(users, ['username', 'email', 'thoughts', 'friends', '_id']);
  console.timeEnd('seeding');
  process.exit(0);
});
