import { User } from "./common.js"

export default function () {
  const tester = Math.ceil(Math.random() * 10)

  // these tester accounts are setup in k6/setup.js
  const username = 'k6tester' + tester;
  const email = username + '@example.com';
  const password = '123456';

  const user = new User(username, email, password)
  
  user.login()
  user.createPost()
}