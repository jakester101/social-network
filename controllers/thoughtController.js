const { Thought, User } = require('../models');

const thoughtController = {
  // get all thoughts
  getThoughts(req, res) {
    Thought.find({})
      .populate({
        path: 'reactions',
        select: '-__v'
      })
      .select('-__v')
      .sort({ _id: -1 })
      .then((thoughtData) => res.json(thoughtData))
      .catch((err) => {
        console.log(err);
        res.status(400).json(err);
      });
  },

  // get single thought by id
  getSingleThought(req, res) {
    Thought.findOne({ _id: req.params.thoughtId })
      .populate({
        path: 'reactions',
        select: '-__v'
      })
      .select('-__v')
      .then((thoughtData) => {
        if (!thoughtData) {
          return res.status(404).json({ message: 'No thought found with this id!' });
        }
        res.json(thoughtData);
      })
      .catch((err) => {
        console.log(err);
        res.status(400).json(err);
      });
  },

  // create a new thought
  createThought(req, res) {
    Thought.create(req.body)
      .then((thoughtData) => {
        return User.findOneAndUpdate(
          { username: req.body.username },
          { $push: { thoughts: thoughtData._id } },
          { new: true }
        );
      })
      .then((userData) => {
        if (!userData) {
          return res.status(404).json({ message: 'No user found with this username!' });
        }
        res.json({ message: 'Thought created and added to user!', userData });
      })
      .catch((err) => {
        console.log(err);
        res.status(400).json(err);
      });
  },

  // update thought by id
  updateThought(req, res) {
    Thought.findOneAndUpdate({ _id: req.params.thoughtId }, req.body, {
      new: true,
      runValidators: true
    })
      .then((thoughtData) => {
        if (!thoughtData) {
          return res.status(404).json({ message: 'No thought found with this id!' });
        }
        res.json(thoughtData);
      })
      .catch((err) => {
        console.log(err);
        res.status(400).json(err);
      });
  },

  // delete thought by id
  deleteThought(req, res) {
    Thought.findOneAndDelete({ _id: req.params.thoughtId })
      .then((thoughtData) => {
        if (!thoughtData) {
          return res.status(404).json({ message: 'No thought found with this id!' });
        }
        // remove the thought's ID from the associated user's thoughts array
        return User.findOneAndUpdate(
          { username: thoughtData.username },
          { $pull: { thoughts: thoughtData._id } },
          { new: true }
        );
      })
      .then(() => {
        res.json({ message: 'Thought and associated user data deleted!' });
      })
      .catch((err) => {
        console.log(err);
        res.status(400).json(err);
      });
  },

// add a reaction to a thought
createReaction(req, res) {
  Thought.findOneAndUpdate(
    { _id: req.params.thoughtId },
    { $addToSet: { reactions: req.body } },
    { new: true, runValidators: true }
  )
    .then((thoughtData) => {
      if (!thoughtData) {
        return res.status(404).json({ message: 'No thought found with this id!' });
      }
      res.json(thoughtData);
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
},

// delete a reaction from a thought
deleteReaction(req, res) {
  Thought.findOneAndUpdate(
    { _id: req.params.thoughtId },
    { $pull: { reactions: { reactionId: req.params.reactionId } } },
    { new: true }
  )
    .then((thoughtData) => {
      if (!thoughtData) {
        return res.status(404).json({ message: 'No thought found with this id!' });
      }
      res.json(thoughtData);
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
}
};

module.exports = thoughtController;
