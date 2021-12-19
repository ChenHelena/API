let orderData = [];
let orderList = document.querySelector(".js-orderList")
function init() {
  getOrderList();
}
init();
//取得訂單列表
function getOrderList() {
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`, {
    headers: {
      "Authorization": token
    }
  })
    .then(function (response) {
      orderData = response.data.orders;
      let str = "";
      orderData.forEach(function (item) {
        //組訂單品項字串
        let productStr = "";
        item.products.forEach(function (productItem) {
          productStr += `<p>${productItem.title}x${productItem.quantity}</p>`
        })
        //訂單時間狀態
        const timeStamp = new Date(item.createdAt * 1000)
        const orderTime = `${timeStamp.getFullYear()}/${timeStamp.getMonth() + 1}/${timeStamp.getDate()}`

        //組訂單狀態
        let orderStatus = "";
        if (item.paid == true) {
          orderStatus = "已處理"
        } else {
          orderStatus = "未處理"
        }
        //組訂單全部資料
        str += `<tr>
            <td>${item.id}</td>
            <td>
              <p>${item.user.name}</p>
              <p>${item.user.tel}</p>
            </td>
            <td>${item.user.address}</td>
            <td>${item.user.email}</td>
            <td>
              <p>${productStr}</p>
            </td>
            <td>${orderTime}</td>
            <td class="orderStatus">
              <a href="#" class="js-orderStatus" data-status="${item.paid}" data-id="${item.id}">${orderStatus}</a>
            </td>
            <td>
              <input type="button" class="delSingleOrder-Btn js-orderDelete" value="刪除" data-id="${item.id}">
            </td>
          </tr>`
      })
      orderList.innerHTML = str;
      renderc3LV2();
    })
}

orderList.addEventListener("click", function (e) {
  e.preventDefault();
  const targetClass = e.target.getAttribute("class");
  console.log(targetClass);
  let id = e.target.getAttribute("data-id");
  if (targetClass == "delSingleOrder-Btn js-orderDelete") {
    deleteOrderItem(id)
    return;
  }
  if (targetClass == "js-orderStatus") {
    let status = e.target.getAttribute("data-status");

    changeOrderStatus(status, id)
    return;

  }
})

//修改訂單狀態
function changeOrderStatus(status, id) {
  let newStatus;
  if (status == true) {
    newStatus = false;
  } else {
    newStatus = true
  }
  axios.put(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`, {
    "data": {
      "id": id,
      "paid": newStatus
    }
  }, {
    headers: {
      "Authorization": token
    }
  })
    .then(function (response) {
      alert("修改訂單成功！");
      getOrderList();
    })
}

//刪除單筆訂單
function deleteOrderItem(id) {
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/${id}`, {
    headers: {
      "Authorization": token
    }
  })
    .then(function (response) {
      alert("刪除訂單成功！");
      getOrderList();
    })
}
//圖表顯示
function renderc3() {
  //資料整理
  let total = {};
  orderData.forEach(function (item) {
    item.products.forEach(function (itemProduct) {
      if (total[itemProduct.category] == undefined) {
        total[itemProduct.category] = itemProduct.price * itemProduct.quantity
      } else {
        total[itemProduct.category] += itemProduct.price * itemProduct.quantity
      }
    })
  })
  let totalAry = Object.keys(total)
  let newArray = [];
  totalAry.forEach(function (item) {
    let ary = [];
    ary.push(item);
    ary.push(total[item]);
    newArray.push(ary)
  })

  // C3.js
  let chart = c3.generate({
    bindto: '#chart', // HTML 元素綁定
    data: {
      type: "pie",
      columns: newArray,
      colors: {
        "Louvre 雙人床架": "#DACBFF",
        "Antony 雙人床架": "#9D7FEA",
        "Anty 雙人床架": "#5434A7",
        "其他": "#301E5F",
      }
    },
  });
}

function renderc3LV2() {
  //資料抓取
  let total = {};
  orderData.forEach(function (item) {
    item.products.forEach(function (productItem) {
      if (total[item.title] == undefined) {
        total[productItem.title] = productItem.price * productItem.quantity
      } else {
        total[productItem.title] += productItem.price * productItem.quantity
      }
    })
  })
  //c3陣列顯示
  let totalAry = Object.keys(total)
  let newArray = [];
  totalAry.forEach(function (item) {
    let ary = [];
    ary.push(item);
    ary.push(total[item])
    newArray.push(ary);
  })

  //資料排序
  newArray.sort(function (a, b) {
    return b[1] - a[1];
  })
  //超過四筆統整為其他

  if (newArray.length > 3) {
    let otherTotal = 0;
    newArray.forEach(function (item, index) {
      if (index > 2) {
        otherTotal += newArray[index][1];
      }
    })
    newArray.splice(3, newArray.length - 1);
    newArray.push(['其他', otherTotal])
  }




  // C3.js
  let chart = c3.generate({
    bindto: '#chart', // HTML 元素綁定
    data: {
      type: "pie",
      columns: newArray,
      colors: {
        "Louvre 雙人床架": "#DACBFF",
        "Antony 雙人床架": "#9D7FEA",
        "Anty 雙人床架": "#5434A7",
        "其他": "#301E5F",
      }
    },
  });
}


//刪除全部訂單
const discardAllBtn = document.querySelector(".discardAllBtn")
discardAllBtn.addEventListener("click", function (e) {
  e.preventDefault();
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`, {
    headers: {
      "Authorization": token
    }
  })
    .then(function (response) {
      alert("刪除全部訂單成功！");
      getOrderList();
    })
})

