import { User } from './common.js';

export default function () {
  for(let i = 1; i <= 10; i++) {
    const username = 'k6tester' + i;
    const email = "k6tester" + i + "@example.com";
    const password = "123456"
    
    let user = new User(username, email, password)
    user.register()
  }
}