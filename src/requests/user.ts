import {
  LoginMutationResponse,
} from "~/typings";
import { GraphQLClient, gql } from 'graphql-request'
import {
  GQL_URL,
  ADMIN_EMAIL,
  ADMIN_PASSWORD
} from "."


export type UserPublic = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
}


export const LOG_IN_USING_EMAIL = gql`
  mutation logInUsingEmail(
    $email: String!
    $password: String!
  ) {
    logInUsingEmail(
      email: $email
      password: $password
    ) {
      jwt
      setCookie
      user {
        id
        email
      }
    }
  }
`;

export const GET_USER = gql`
  query getUser {
    user {
      id
      ... on UserPrivate {
        firstName
        lastName
        email
        createdAt
      }
    }
  }
`;


export const login_as_user = async (
  email: string,
  password: string,
): Promise<LoginMutationResponse> => {

  const client = new GraphQLClient(GQL_URL)

  interface Qvar {
    email: string
    password: string
  }
  interface Qdata {
    logInUsingEmail: LoginMutationResponse
  }

  return client.request<Qdata, Qvar>(LOG_IN_USING_EMAIL, {
    email: email,
    password: password
  }).then((response) => {
    // console.log('login response: ', response)
    return {
      ...response.logInUsingEmail,
      authCookie: `gun-auth=${response.logInUsingEmail?.setCookie}`,
    }
  })
}

export const login_as_system = async () => {
  return login_as_user(ADMIN_EMAIL, ADMIN_PASSWORD)
}

export const get_user_profile = async (
  authCookie: string
): Promise<UserPublic> => {

  const client = new GraphQLClient(GQL_URL, {
    // credentials: 'include', // not needed
    headers: {
      'cookie': authCookie,
    }
  })

  interface Qdata {
    user: UserPublic
  }

  return client.request<Qdata>(GET_USER).then((data) => {
    // console.log('GET_USER: ', data)
    return data.user
  })
}

