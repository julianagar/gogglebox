const express = require("express");
const bodyParser = require("body-parser");
const https = require("https");
const request = require('request')
const ejs = require("ejs");
const axios = require("axios");
const alert = require('alert');
const SerpApi = require('google-search-results-nodejs');
const search = new SerpApi.GoogleSearch("267d6f17039465b2a30d781461e7a001e43d4ba0678cf5e6d4ae56cf9699b6a1");


const app = express() 

app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));

function wait(ms){
  var start = new Date().getTime();
  var end = start;
  while(end < start + ms) {
    end = new Date().getTime();
 }
}


app.get("/", function(req, res) {

    res.render("home")
})

app.post("/", function(req, res) {
    const searchTerm = req.body.query
    console.log(searchTerm)

    const options = {
        method: 'GET',
        url: 'https://movie-database-alternative.p.rapidapi.com/',
        params: {s: searchTerm, r: 'json', page: '1'},
        headers: {
          'X-RapidAPI-Key': '4f6fd7410bmsh2ba3c17a2e1e6f6p1b50b3jsnceb599548749',
          'X-RapidAPI-Host': 'movie-database-alternative.p.rapidapi.com'
        }
      };
      
      
      axios.request(options).then(function (response) {
          const result = response.data
          console.log(result)

          // try {
            if (result.Search.length > 1) {
              const results = []
              result.Search.forEach(element => {
                  results.push(element)
              })
  
              console.log(results)
              res.render("results", {list: results})
            } else {
            const ID = result.Search[0].imdbID
  
            console.log(ID)
  
  
            const options = {
              method: 'GET',
              url: 'https://movie-details1.p.rapidapi.com/imdb_api/movie',
              params: {id: ID},
              headers: {
                'X-RapidAPI-Key': '4f6fd7410bmsh2ba3c17a2e1e6f6p1b50b3jsnceb599548749',
                'X-RapidAPI-Host': 'movie-details1.p.rapidapi.com'
              }
            };

            const actorImages = []

            
            axios.request(options).then(function (response) {

              const showData = response.data

             
              const actors = showData.actors.slice(0,5)

              actors.forEach(p => {
                search.json({
                  api_keys: "267d6f17039465b2a30d781461e7a001e43d4ba0678cf5e6d4ae56cf9699b6a1",
                  q: p.name,
                  tbm: "isch",
                  location: "Austin, TX"
                }, (data) => {
                  console.log(data.image_results.original)
                })

                const callback = function(data) {
                  const img = data["image_results"]
                  
                  console.log(img)
                  actorImages.push(img)
                }

              }) 
              res.render("content", {data: showData, images: actorImages})

              
            }).catch(function (error) {
                console.error(error);
            });
            }
          // }
          // catch(err) {
          //   alert("an error occured. this could be because there are no results for your query. ")
          // }

       
          
      }).catch(function (error) {
          console.error(error);
      });
})

app.post("/results", function(req, res) {
    const ID = req.body.selected

    const options = {
      method: 'GET',
      url: 'https://movie-details1.p.rapidapi.com/imdb_api/movie',
      params: {id: ID},
      headers: {
        'X-RapidAPI-Key': '4f6fd7410bmsh2ba3c17a2e1e6f6p1b50b3jsnceb599548749',
        'X-RapidAPI-Host': 'movie-details1.p.rapidapi.com'
      }
    };
    
    axios.request(options).then(function (response) {
          console.log(response.data);
          res.render("content", {data: response.data})
    }).catch(function (error) {
        console.error(error);
    });
});

app.get("/about", function(req, res) {
    res.render("about")
})

app.listen(process.env.PORT || 3000, function() {
  console.log("server started!")
})

