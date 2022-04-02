import http, { post } from 'k6/http';
import { parseHTML } from 'k6/html';
import { check, fail, sleep } from 'k6';
import { Faker } from "k6/x/faker"

export class User {
  constructor(username, email, password) {
    this.username = username;
    this.email = email;
    this.password = password;
  }

  register() {
    let page = http.get("http://slackernews/accounts/login");
  
    let res = page.submitForm({
      formSelector: 'form[action="/accounts/login/check_signup"]',
      fields: {
        username: this.username,
        email: this.email,
        password: this.password,
      }
    });
  
    let result = parseHTML(res.body);
    let errors = result.find('div.errors').last().text();
    if(errors != "") {
      console.error(errors, this.email)
    }
  
    check(res, {
      [this.email + ' was created successfully']: (res) => res.status == 200 && errors == "",
    })
  }

  login() {
    let page = http.get("http://slackernews/accounts/login");
  
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
    let page = http.get("http://slackernews/submit");
  
    let res = page.submitForm({
      fields: {
        title: randomTitle(),
        url: f.url(),
      }
    });

    console.log("post creation result", res.status)
  }

  vote() {
    let page = http.get("http://slackernews/");
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
    let res = http.post("http://slackernews/upvote-post", vote, {
      headers: {
        'X-CSRFToken': cookiesForURL.csrftoken,
        'Content-Type': 'application/json'
      },
    });
    
    console.log("vote result", res.status, res.body)
  }
}

export function randomTitle() {
  let f = new Faker();
  const seed = Math.ceil(Math.random() * 10);

  switch(true) {
    case seed < 3:
      return f.quote()
    case seed < 6:
      return f.sentence(Math.ceil(Math.random() * 10))
    default:
      return f.question()
  }
}