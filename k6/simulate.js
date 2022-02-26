import http from 'k6/http';
import { check, fail, sleep } from 'k6';

class RandomUser {
  constructor() {
    const tester = Math.ceil(Math.random() * 10)

    // these tester accounts are setup in k6/setup.js
    this.email = 'k6-tester' + tester + '@example.com'
    this.password = '123456'
  }

  login() {
    const params = {
      token: true,
      email: this.email,
      password: '123456',
    }

    const headers = {
      'Accept': 'application/json',
    }

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

    return token
  }
}

class Checkout {
  constructor() {
    this.user = new RandomUser()
    this.getToken()
  }

  getToken() {
    this.token = this.user.login()
    if (this.token == null) {
      throw new Error("cannot retrieve token")
    }
  }

  addToCart() {
    const productId = Math.ceil(Math.random() * 6)
    const quantity = Math.ceil(Math.random() * 5)

    const params = {
      product_id: productId,
      quantity: quantity,
    }
    const res = http.post("http://nginx/api/checkout/cart/add/" + productId, params, {
      headers: {
        'Accept': 'application/json',
      }
    });
    check(res, {
      'Item must be added to the cart successfully': (res) => res.status == 200,
    })
  }

  saveAddress() {
    let res = http.get("http://nginx/api/addresses?token=true", {
      headers: {
        'Accept': 'application/json',
        // for some reason this endpoint doesn't use the token in the session
        'Authorization': 'Bearer ' + this.token,
      }
    });
    check(res, {
      'Address list must be retrieved successfully': (res) => res.status == 200,
    })

    const address = JSON.parse(res.body)
    let params = {
      "billing": {
        "address1": {
          "0": ""
        },
        "use_for_shipping": false,
        "first_name": "Tester",
        "last_name": "McNifty",
        "email": this.email,
        "address_id": address.data[0].id,
      },
      "shipping": {
        "address1": {
          "0": ""
        },
        "first_name": "Tester",
        "last_name": "McNifty",
        "email": this.email,
        "address_id": address.data[0].id,
      },
    }

    res = http.post("http://nginx/api/checkout/save-address", JSON.stringify(params), {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });
    check(res, {
      'Address must be saved to the cart successfully': (res) => res.status == 200,
    })
  }

  saveShippingMethod() {
    // the cart we're referring to is in the session, so no token is required
    const res = http.post("http://nginx/api/checkout/save-shipping", JSON.stringify({ shipping_method: 'free_free' }), {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });
    check(res, {
      'Shipping method must be saved to the cart successfully': (res) => res.status == 200,
    })
  }

  savePaymentMethod() {
    const res = http.post("http://nginx/api/checkout/save-payment", JSON.stringify({ payment: { method: "cashondelivery" } }), {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });
    check(res, {
      'Payment method must be saved to the cart successfully': (res) => res.status == 200,
    })
  }

  placeOrder() {
    const res = http.post("http://nginx/api/checkout/save-order", {}, {
      headers: {
        'Accept': 'application/json',
      }
    });
    check(res, {
      'Order must be placed successfully': (res) => res.status == 200,
    })
  }
}

export default function () {
  let c = new Checkout()

  // spread out the orders a bit
  sleep(Math.random() * 30)

  c.addToCart()

  // 20% chance of abandoning cart
  if (Math.random() <= 0.2) {
    console.log("abandoned cart")
    return
  }

  c.saveAddress()
  c.saveShippingMethod()
  c.savePaymentMethod()
  c.placeOrder()
}