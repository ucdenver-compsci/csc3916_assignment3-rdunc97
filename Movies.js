var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.connect("mongodb+srv://ryanduncan02:G5b6t56hD4bUri67@cluster0.cdwdktp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", { useNewUrlParser: true, useUnifiedTopology: true });

// Movie schema
var MovieSchema = new Schema({
    title: { type: String, required: true, index: true },
    releaseDate: Date,
    genre: {
      type: String,
      enum: [
        'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Mystery', 'Thriller', 'Western', 'Science Fiction'
      ],
    },
    actors: [{
      actorName: String,
      characterName: String,
    }],
});

// return the model
module.exports = mongoose.model('Movie', MovieSchema);