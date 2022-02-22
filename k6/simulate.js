import http from 'k6/http';
import { check, fail, sleep } from 'k6';

export default function () {
  const tester = Math.ceil(Math.random() * 10);
  const email = 'k6-tester' + tester + '@example.com';
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

  sleep(Math.random() * 30)

  const productId = Math.ceil(Math.random() * 5)
  const quantity = Math.ceil(Math.random() * 5)

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

  // 20% chance of abandoning cart
  if(Math.random() < 0.2) {
    return
  }

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