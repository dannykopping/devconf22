import http from 'k6/http';
import { check, fail } from 'k6';
import { parseHTML } from 'k6/html';

export default function () {
  for(let i = 1; i <= 10; i++) {
    const username = 'tester' + i;
    const email = "k6-tester" + i + "@example.com";
    const password = "123456"
    createUser(username, email, password)
  }
}

function createUser(username, email, password) {
  let page = http.get("http://datatau/accounts/login");

  let res = page.submitForm({
    formSelector: 'form[action="/accounts/login/check_signup"]',
    fields: {
      username: username,
      email: email,
      password: password,
    }
  });

  let result = parseHTML(res.body);
  let errors = result.find('div.errors').last().text();
  if(errors != "") {
    console.error(errors, email)
  }

  check(res, {
    [email + ' was created successfully']: (res) => res.status == 200 && errors == "",
  })
}