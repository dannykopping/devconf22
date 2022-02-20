import http from 'k6/http';
import { parseHTML } from 'k6/html';
import { check, fail, sleep } from 'k6';

export const options = {
  vus: 10,
  iterations: 50,
};

export default function () {
  // let res = http.get('http://nginx/red-tulip');
  // let doc = parseHTML(res.body);
  // const csrfToken = doc.find('head meta[name="csrf-token"]').attr("content");
  // const vuJar = http.cookieJar();
  // const cookiesForURL = vuJar.cookiesForURL(res.url);

  const email = 'k6-tester1@example.com'
  let params = {
    token: true,
    email: email,
    password: '123456',
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
  } catch (e) { }

  check(token, {
    'JWT token MUST be non-null': (token) => token != null,
  })

  sleep(Math.random() * 3)

  const productId = Math.ceil(Math.random() * 5)
  const quantity = Math.ceil(Math.random() * 3)

  params = {
    product_id: productId,
    quantity: quantity,
  }
  res = http.post("http://nginx/api/checkout/cart/add/" + productId, params, { headers: headers });
  check(res, {
    'Item must be added to the cart successfully': (res) => res.status == 200,
  })

  res = http.get("http://nginx/api/addresses?token=true", {
    headers: {
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + token,
    }
  });

  // todo: add check

  const address = JSON.parse(res.body)
  params = {
    "billing": {
      "address1": {
        "0": ""
      },
      "use_for_shipping": false,
      "first_name": "Tester",
      "last_name": "McNifty",
      "email": email,
      "address_id": address.data[0].id,
    },
    "shipping": {
      "address1": {
        "0": ""
      },
      "first_name": "Tester",
      "last_name": "McNifty",
      "email": email,
      "address_id": address.data[0].id,
    },
    // 'token': true,
  }

  // the cart we're referring to is in the session, so no token is required
  res = http.post("http://nginx/api/checkout/save-address", JSON.stringify(params), {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  });

  console.log(JSON.parse(res.body).data.cart.id)

  // the cart we're referring to is in the session, so no token is required
  res = http.post("http://nginx/api/checkout/save-shipping", JSON.stringify({shipping_method: 'free_free'}), {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  });

  console.log(JSON.parse(res.body).data.cart.id)

  // the cart we're referring to is in the session, so no token is required
  res = http.post("http://nginx/api/checkout/save-payment", JSON.stringify({payment: {method: "cashondelivery"}}), {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  });

  console.log(JSON.parse(res.body).data.cart.id)

  // the cart we're referring to is in the session, so no token is required
  res = http.post("http://nginx/api/checkout/save-order", {}, {
    headers: {
      'Accept': 'application/json',
    }
  });

  console.log(res.status)
}