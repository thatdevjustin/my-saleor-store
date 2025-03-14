// lib/apolloClient.ts
import { ApolloClient, InMemoryCache } from "@apollo/client";

// Point this to your Saleor endpoint running at localhost:8000
const client = new ApolloClient({
  uri: "http://localhost:8000/graphql/",
  cache: new InMemoryCache(),
});

export default client;
