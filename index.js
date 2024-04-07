const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose');
const {Schema} = mongoose;

mongoose.connect(process.env.DB_URL);

// Schema and model for User
const UserSchema = new Schema({
  username: String,
});
const User = mongoose.model("User", UserSchema);

// Schema and model for Exercise
const ExerciseSchema = new Schema(
  {
    user_id: {type: String, required: true},
    description: String,
    duration: Number,
    date: Date
  }
);
const Exercise = mongoose.model("Exercise", ExerciseSchema);

app.use(cors())
app.use(express.static('public'))
app.use(express.urlencoded({extended: true}));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// Create new user
app.post('/api/users', async (req, res) => {
  console.log(req.body);
  const userObj = new User({
    username: req.body.username
  });
  const user = await userObj.save().then(
    function (user){
      //console.log(user);
      res.json(user);
    }
  ).catch(
    function (err){
      console.log(err);
    }
  );
});

// Exercise
app.post('/api/users/:id/exercises', async (req, res) => {
  const id = req.params.id;
  console.log(req.body);
  const {description, duration, date} = req.body;
  const user = await User.findById(id).then(
    async function (user){
      console.log(user);
      const exerciseObj = new Exercise( {
        user_id: user._id,
        description,
        duration,
        date: date? new Date(date): new Date()
      });
      const exercise = await exerciseObj.updateOne();
      res.json(
        {
          _id: user._id,
          username: user.username,
          description: exercise.description,
          duration: exercise.duration,
          date: new Date(exercise.date).toDateString()
        }
      );
    }
  ).catch(
    function (err){
      console.log(err);
    }
  );
});



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
