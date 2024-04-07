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
  console.log("body is ");
  console.log(req.body);
  const {id1, description, duration, date} = req.body;
  console.log(description);
  const user = await User.findById(id).then(
    async function (user){
      console.log(user);
      const exerciseObj = new Exercise( {
        user_id: user._id,
        description: description,
        duration: duration,
        date: date? new Date(date): new Date()
      });
      const exercise = await exerciseObj.save();
      console.log('exercise'
      );
      console.log(exercise);
      res.json(
        {         
          username: user.username,
          description: exercise.description,
          duration: exercise.duration,
          date: new Date(exercise.date).toDateString(),
          _id: user._id,
        }
      );
    }
  ).catch(
    function (err){
      console.log(err);
    }
  );
});
// all users
app.get("/api/users", async (req, res) => {
  const users = await User.find({}).select("_id username");
  if (!users){
    res.send("No users");
  } else {
    res.json(users);
  }
});

// Log
app.get("/api/users/:_id/logs", async (req, res) => {
  let {from, to, limit} = req.query;
  console.log("Query para");
  console.log(req.query);
  const id = req.params._id;
  /*
  const foundUser = await User.findById(id);
  if (!foundUser){
    res.json({message: 'No user exists'});
  }

  let filter = {id};
  let dateFilter = {};
  if (from){
    dateFilter['$gte'] = new Date(from);
  }

  if (to){
    dateFilter['$lte'] = new Date(to);
  }
  if (from || to){
    filter.dateFilter = dateFilter;
  }
  if (!limit){
    limit = 100;
  }

  let exercises = await Exercise.find(filter).limit(+limit);
  console.log("length");
  console.log(exercises.length);
  resultExercises = exercises.map((exercise) => {
    return {
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date.toDateString()
    }
  });

  res.json({
    username: foundUser.username,
    count: resultExercises.length,
    _id: id,
    log: resultExercises
  }); */

  const user = await User.findById(id).then(
    async function (user){
      let dateObj = {};
      if (from){
        dateObj["$gte"] = new Date(from).toDateString();
      }
      if (to){
        dateObj["$lte"] = new Date(to).toDateString();
      }
      let filter = { user_id: id};
      if (from || to){
        filter.date = dateObj;
      }
      /*if(!limit){
        limit = 100;
      } */
      console.log("limit is " + limit);
      console.log(filter);
      const exercises2 = await Exercise.find(filter).then(
        function (exercises){
          if (limit){
            exercises = exercises.slice(0,limit);
          }
          //const exercises = await Exercise.find(filter);
      console.log("Exercisesssss ");
      console.log(exercises);
      const log = exercises.map( e => ({
        description: e.description,
        duration: e.duration,
        date: e.date.toDateString()
      }));
      res.json(
        {
          username: user.username,
          count: exercises.length,
          _id: user._id,
          log: log
        }
      );
        }
      ).catch(
        function (err){
          console.log(err);
        }
      );
      
    }
  ).catch(
    function (err){
      console.log(err);
    }
  ); 
})




const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
