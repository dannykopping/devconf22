import http from 'k6/http';
import { parseHTML } from 'k6/html';
import { check, fail } from 'k6';

export default function () {
  // let res = http.get('http://nginx/red-tulip');
  // let doc = parseHTML(res.body);
  // const csrfToken = doc.find('head meta[name="csrf-token"]').attr("content");
  // const vuJar = http.cookieJar();
  // const cookiesForURL = vuJar.cookiesForURL(res.url);

  let params = {
    token: true,
    email: 'k6@example.com',
    password: 'tester',
  };
  let headers = {
    'Accept': 'application/json',
  };
  
  let res = http.post("http://nginx/api/customer/login", params, { headers: headers });

  check(res, {
    'JWT token retrieval MUST succeed': (res) => res.status == 200,
  })

  let token = null
  try {
    token = JSON.parse(res.body).token
  } catch(e) {}

  check(token, {
    'JWT token MUST be non-null': (token) => token != null,
  })

  params = {
    product_id: 3,
    quantity: 1,
  }
  res = http.post("http://nginx/api/checkout/cart/add/3", params, { headers: headers });

  console.log(res.body)
}