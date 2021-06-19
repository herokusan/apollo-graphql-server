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

  async function getGeocoding(){
 
    // Geocode an address to coordinates
  
    // Reverse geocode coordinates to address.
    // geocoding.reverseGeocode('mapbox.places', '4.8936580', '52.3731720', function (err, geoData) {
    //     console.log(geoData);
    // });
  }
  getGeocoding()

  async function setData(fromPlace, toPlace){
    //Map Box Here!
    const data = await new tripModel({
      fromPlace: {},
      toPlace:{}
    })
    console.log(data)
    const formPlaceGeocoding = await geocoding.geocode('mapbox.places', `${fromPlace}`, function (err, geoData) {
      if(err){
        console.log(err)
      }else{
        // data.fromPlace = {id:geoData.features[3].id}
        // console.log(geoData.features[3]);
      }
    });
    const toPlaceGeocoding = await geocoding.geocode('mapbox.places', `${toPlace}`, function (err, geoData) {
      if(err){
        console.log(err)
      }else{
        // data.toPlace = {id:geoData.features[3].id}
        // console.log(geoData.features[3]);
      }
    });
    // data.save()
    return data
  }


  var Trip  = [{
    id: Test,
    fromPlace:{
      name: "Kyiv"
    },
    toPlace:{
      name:"Berlin"
    }
}]


  const resolvers = {
    Mutation: {
      createTrip: (parent, args) => {
        setData(args.input.fromPlaceName, args.input.toPlaceName)
        console.log(create_id)
        const data = {
          id: '12312312',
          fromPlace:{
            id:'123123',
            name: args.input.fromPlaceName
          },
          toPlace:{
            id: "123123",
            name: args.input.toPlaceName
          }
        }
        return data
      }
    },
    Query: {
      trips: (parent, args) => Trip
       
        // ALL Trips
        
        // GetAllTrip(args.limit, args.offset).then(data => {
        //   console.log()
        //   console.log(result)
        // return result
        // }
    }
  };

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});