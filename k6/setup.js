import http from 'k6/http';
import { check, fail } from 'k6';

export default function () {
  for(let i = 1; i <= 10; i++) {
    const email = "k6-tester" + i + "@example.com";
    const password = "123456"
    createUser(email, password)
    createAddress(email, password)
  }
}

function createUser(email, password) {
  const params = {
    email: email,
    first_name: "Tester",
    last_name: "McNifty",
    password: password,
    password_confirmation: password,
  };
  const headers = {
    'Accept': 'application/json',
  };

  let res = http.post("http://nginx/api/customer/register", params, {headers: headers});
  check(res, {
    [email + ' was created successfully']: (res) => res.status == 200,
  })
}

function createAddress(email, password) {
  let token = getToken(email, password)
  
  const address = {
    "address1": ["1"],
    "use_for_shipping": "true",
    "first_name": "Tester",
    "last_name": "McNifty",
    "email": email,
    "city": "Bitcoindia",
    "state": "Etherland",
    "postcode": "12345",
    "country": "ZA",
    "phone": "1800123456"
  };

  let res = http.post("http://nginx/api/addresses/create?token=true", JSON.stringify(address), {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    }
  });

  check(res, {
    ['Address for ' + email + ' was created successfully']: (res) => res.status == 200,
  })
}

function getToken(email, password) {
  let params = {
    token: true,
    email: email,
    password: password,
  };
  let headers = {
    'Accept': 'application/json',
  };

  let res = http.post("http://nginx/api/customer/login", params, { headers: headers });

  check(res, {
    ['JWT token retrieval for ' + email + ' MUST succeed']: (res) => res.status == 200,
  })

  let token = null
  try {
    token = JSON.parse(res.body).token
  } catch (e) { }

  check(token, {
    ['JWT token for ' + email + ' MUST be non-null']: (token) => token != null,
  })

  return token
}