//取得產品列表
function getProductList() {
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`)
    .then(function (response) {
      productData = response.data.products;
      renderProductList()
    })
}

function init() {
  getProductList();
  getCartList()
}
init();

let productData = [];
let cartData = [];

//初始化產品列表
const productWrap = document.querySelector('.productWrap');
const productSelect = document.querySelector('.productSelect');
const shoppingCartBody = document.querySelector('.shoppingCartBody')


//字串結合
function combineProductString(item) {
  return `<li class="productCard">
        <h4 class="productType">新品</h4>
        <img
          src="${item.images}">
        <a href="#" class="js-addCart" data-id=${item.id}>加入購物車</a>
        <h3>${item.title}</h3>
        <del class="originPrice">NT$${toCurrency(item.origin_price)}</del>
        <p class="nowPrice">NT$${toCurrency(item.price)}</p>
      </li>`
}

//初始化列表
function renderProductList() {
  let str = "";
  productData.forEach(function (item) {
    str += combineProductString(item)
  })
  productWrap.innerHTML = str;
}

//篩選產品列表
productSelect.addEventListener('change', function (e) {
  let category = e.target.value
  if (category == "全部") {
    renderProductList()
    return;
  }
  let str = "";
  productData.forEach(function (item) {
    if (item.category == category) {
      str += combineProductString(item)
    }
  })
  productWrap.innerHTML = str;
})

//購物車列表
productWrap.addEventListener('click', function (e) {
  e.preventDefault();
  let addCartClass = e.target.getAttribute('class')
  if (addCartClass !== "js-addCart") {
    return;
  }
  let productId = e.target.getAttribute('data-id')
  let numCheck = 1;
  cartData.forEach(function (item) {
    if (item.product.id == productId) {
      numCheck = item.quantity += 1
    }
  })

  axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`, {
    data: {
      "productId": productId,
      "quantity": numCheck
    }
  })
    .then(function (response) {
      alert("加入購物車");
      getCartList()
    })

})

// 加入購物車
function getCartList() {
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
    .then(function (response) {
      cartData = response.data.carts;
      document.querySelector(".js-total").textContent = toCurrency(response.data.finalTotal)
      let str = '';
      cartData.forEach(function (item) {
        str += `
          <tr>
            <td>
              <div class="cardItem-title">
                <img src="${item.product.images}" alt="">
                <p>${item.product.title}</p>
              </div>
            </td>
            <td>NT$${toCurrency(item.product.price)}</td>
            <td>${item.quantity}</td>
            <td>NT$${toCurrency(item.product.price * item.quantity)}</td>
            <td class="discardBtn">
              <a href="#" class="material-icons" data-id="${item.id}">
                clear
              </a>
            </td>
          </tr>
        `
      })
      shoppingCartBody.innerHTML = str;
    })

}

// 刪除購物車內特定產品
shoppingCartBody.addEventListener("click", function (e) {
  e.preventDefault();
  const cardId = e.target.getAttribute("data-id")
  if (cardId == null) {
    return;
  }
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${cardId}`)
    .then(function (response) {
      alert("刪除單筆購物車成功！");
      getCartList();
    })
})

//刪除全部購物車產品
const discardAllBtn = document.querySelector(".discardAllBtn")
discardAllBtn.addEventListener("click", function (e) {
  e.preventDefault();
  console.log(e.target);
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`).
    then(function (response) {
      alert("刪除全部購物車成功！");
      getCartList();
    })
    .catch(function (response) {
      alert("購物車已清空,請勿重複點擊")
    })
})

//送出預訂資料
const orderInfoBtn = document.querySelector(".orderInfo-btn")
orderInfoBtn.addEventListener("click", function (e) {
  e.preventDefault();
  if (cartData.length == 0) {
    alert("加入購物車資料")
  }
  const customerName = document.querySelector("#customerName").value;
  const customerPhone = document.querySelector("#customerPhone").value;
  const customerEmail = document.querySelector("#customerEmail").value;
  const customerAddress = document.querySelector("#customerAddress").value;
  const tradeWay = document.querySelector("#tradeWay").value;
  console.log(customerName, customerPhone, customerEmail, customerAddress, tradeWay);
  if (customerName == "" || customerPhone == "" || customerEmail == "" || customerAddress == "" || tradeWay == "") {
    alert("請填寫完整資料");
    return;
  }

  axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`,
    {
      "data": {
        "user": {
          "name": customerName,
          "tel": customerPhone,
          "email": customerEmail,
          "address": customerAddress,
          "payment": tradeWay
        }
      }
    }
  ).
    then(function (response) {
      alert("送出訂單成功！");
      document.querySelector("#customerName").value = "";
      document.querySelector("#customerPhone").value = "";
      document.querySelector("#customerEmail").value = "";
      document.querySelector("#customerAddress").value = "";
      document.querySelector("#tradeWay").value = "ATM";
      getCartList();
    })
})

//千分位
function toCurrency(num) {
  let parts = num.toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}