const { ApolloServer, gql } = require('apollo-server');
const tripModel = require("./models/trip")
const mongoose = require('mongoose')
const geocoding = require('mapbox-geocoding');
//pk.eyJ1IjoibHl0dnluc2t5aSIsImEiOiJja3Ezc2ozbWYwcW5jMm5sbjZxdmNoOWc5In0.fHkb9pFdlpwFQpUBdPMYmgs
geocoding.setAccessToken('pk.eyJ1IjoibHl0dnluc2t5aSIsImEiOiJja3Ezc2ozbWYwcW5jMm5sbjZxdmNoOWc5In0.fHkb9pFdlpwFQpUBdPMYmg');
const mongoUrl = `mongodb+srv://Taras:lytvynskyi@cluster0.gtlsw.gcp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

mongoose.connect(mongoUrl, {useUnifiedTopology: true })

const dbconnect = mongoose.connection
dbconnect.on('error', err => console.log(`DB ERROR: ${err}`))
dbconnect.once('open', () => console.log(`Success to connect MongoDB!`))


const typeDefs = gql`
 type Query {
    trips(offset: Int, limit: Int): [Trip!]!
  }

  type Mutation {
    createTrip(input: CreateTripInput!): Trip
  }

  type Trip {
    id: ID! # format "urn::trip:<mongo object id>"
    fromPlace: Location!
    toPlace: Location!
  }

  type Location {
    id: String  # format "urn::mapbox:<mapbox id>" | Get from API by name (feature.id) first result features[0]
    name: String! # Get from API by id (text or place_name)
  }

  input CreateTripInput {
    fromPlaceName: String! # from place name e.g. Kyiv | https://docs.mapbox.com/
    toPlaceName: String!
    },
`;
  
  async function GetAllTrip(limit, offset){
    return await tripModel.find({}).skip(offset).limit(limit)
  }

  async function reverseCode(code){
    geocoding.reverseGeocode('mapbox.places', `${code}`, `${code}`, function (err, geoData) {
      console.log(geoData);
    });
    geocoding.reverseGeocode('mapbox.places', '4.8936580', '52.3731720', function (err, geoData) {
      console.log(geoData);
  });
    return code
  }

  async function setData(fromPlace, toPlace){
    let data = await new tripModel({
      fromPlace:{id:""},
      toPlace:{id:""}
    })
    geocoding.geocode('mapbox.places', `${fromPlace}`, function (err, geoData) {
      if(err){
        console.log(err)
      }else{
        console.log(geoData.features[3].geometry.coordinates)
        data.fromPlace = {id:geoData.features[3].id}
      }
    });
    geocoding.geocode('mapbox.places', `${toPlace}`, function (err, geoData) {
      if(err){
        console.log(err)
      }else{
        data.toPlace = {id:geoData.features[3].id}
      }})
    // setTimeout(function(){
      console.log(data)
      // data.save()
    // },300)
    return data
  }


  var Trip  = [{
    id:123,
    fromPlace:{
      name: "Kyiv"
    },
    toPlace:{
      name:"Berlin"
    }
}]


  const resolvers = {
    Mutation: {
      createTrip: async(parent, args) => {
        const data_set = await setData(args.input.fromPlaceName, args.input.toPlaceName)
        console.log(data_set.id)
        console.log(data_set.fromPlace.id)
        setTimeout(function(){
          data.fromPlace.id = data_set.fromPlace.id
          data.toPlace.id = data_set.toPlace.id
          console.log(">>>>>>>>>>>>>>>>>")
          console.log(">>>>>>>>>>>>>>>>>")
          console.log(data_set.fromPlace.id)

          console.log(data)
        },300)
        const data = {
          id: `urn::trip:${data_set.id}`,
          fromPlace:{
            id: data_set.toPlace.id,
            name: args.input.fromPlaceName
          },
          toPlace:{
            id: data_set.fromPlace.id,
            name: args.input.toPlaceName
          }
        }
        return await data
      }
    },
    Query: {
      trips: async (parent, args) => {
        const all_trip = await GetAllTrip(args.limit, args.offset)
        const data = []
        for(let i = 0; i < all_trip.length; i++){
          const nameFromPlace = reverseCode(all_trip[i].fromPlace.id)
          const nameToPlace = reverseCode(all_trip[i].toPlace.id)

          console.log(nameFromPlace)
          console.log(nameToPlace)
          data.push(
            {id:  `urn::trip:${all_trip[i].id}`,
            fromPlace:{
              name: nameFromPlace
            },
            toPlace:{
              name: nameToPlace
            }
          })
        }
        console.log(all_trip)
        return data
      }
       
        // ALL Trips

    }
  };

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});