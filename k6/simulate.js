import http, { post } from 'k6/http';
import { parseHTML } from 'k6/html';
import { check, fail, sleep } from 'k6';
import { Faker } from "k6/x/faker"

class RandomUser {
  constructor() {
    const tester = Math.ceil(Math.random() * 10)

    // these tester accounts are setup in k6/setup.js
    this.username = 'k6tester' + tester;
    this.email = this.username + '@example.com';
    this.password = '123456';
  }

  login() {
    let page = http.get("http://datatau/accounts/login");
  
    let res = page.submitForm({
      formSelector: 'form[action="/accounts/login/check_login"]',
      fields: {
        username: this.username,
        password: this.password,
      }
    });

    let result = parseHTML(res.body);
    let username = result.find('#me').html();

    check(username, {
      [username + ' logged in successfully']: (username) => username == this.username,
    })
  }

  createPost() {
    let f = new Faker();
    let page = http.get("http://datatau/submit");
  
    let res = page.submitForm({
      fields: {
        title: randomTitle(),
        url: f.url(),
      }
    });
  }

  vote() {
    let page = http.get("http://datatau/");
    let body = parseHTML(page.body);
  
    let posts = body.find('div.votearrow');
    if(posts.size() <= 0) {
      console.log("cannot find a post to upvote")
      return
    }

    const post = posts.get(Math.floor(Math.random() * posts.size())).getAttribute('data-post-id');
    if(post == "") {
      console.log("cannot find a post to upvote")
      return
    }

    const vuJar = http.cookieJar();
    const cookiesForURL = vuJar.cookiesForURL(page.url);

    const vote = JSON.stringify({
      id: post,
    });
    let res = http.post("http://datatau/upvote-post", vote, {
      headers: {
        'X-CSRFToken': cookiesForURL.csrftoken,
        'Content-Type': 'application/json'
      },
    });
    
    console.log(res.status, res.body)
  }
}

export function randomTitle() {
  let f = new Faker();
  const seed = Math.ceil(Math.random() * 10);
  console.log(seed)
  switch(true) {
    case seed < 3:
      return f.quote()
    case seed < 6:
      return f.sentence(Math.ceil(Math.random() * 10))
    default:
      return f.question()
  }
}

export default function () {
  let r = new RandomUser()
  r.login()
  r.createPost()
  for(let i = 0; i < 5; i++) {
    r.vote()
  }
}