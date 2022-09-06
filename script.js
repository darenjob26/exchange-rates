"use strict";
let exchangeRates = [];
const currencies = ["USD", "EUR", "AUD", "CAD", "CHF", "NZD", "BGN"];

// this render the select options
const select = document.getElementById("select");
currencies.forEach((curr) => {
    const option = document.createElement("option");
    option.innerText = curr;
    option.value = curr;

    select.append(option);
});
select.onchange = () => {
    sortAndFilterResults(exchangeRates);
};

// this function will trigger when the document loads
const onLoad = async () => {
    exchangeRates = await fetchWithCache();
    sortAndFilterResults(exchangeRates);
};
onLoad();

// caching the data by saving it to localstorage
async function fetchWithCache() {
    /**
     * this function check if the item 'exchangeRate' exist on localstorage and the saved date is today
     * then saved data from will be used
     * else, it will fetched the data from service then it will be save on localstorage
     */
    let result = [];
    const cache = JSON.parse(localStorage.getItem("exchangeRate"));
    const now = new Date().toLocaleDateString();
    if (cache && cache.date == now) {
        result = cache.result;
    } else {
        const tempCache = {};
        result = await fetchAllExchangeRates();
        tempCache.result = result;
        tempCache.date = now;
        localStorage.setItem("exchangeRate", JSON.stringify(tempCache));
    }

    return result;
}

// fetch data from the service
function fetchAllExchangeRates() {
    const fetchData = (selected, currency) => {
        return new Promise((resolve, reject) => {
            fetch(
                `https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/${selected}/${currency}.json`
            )
                .then((response) => response.json())
                .then((data) => resolve(data));
        });
    };

    return new Promise(async (resolve, reject) => {
        let temp = [];
        //getting all the possible pairs
        for (let i = 0; i < currencies.length; i++) {
            for (let j = 0; j < currencies.length; j++) {
                if (currencies[i] === currencies[j]) break;

                let result = await fetchData(
                    currencies[i].toLowerCase(),
                    currencies[j].toLowerCase()
                );

                temp.push({
                    from: currencies[i],
                    to: currencies[j],
                    exchange: result[currencies[j].toLowerCase()],
                });
            }
        }
        resolve(temp);
    });
}

// sort the fetched data and group it base on the exchange rate
function sortAndFilterResults(data) {
    let group1 = [];
    let group2 = [];
    let group3 = [];

    data.forEach((res) => {
        if (res.to === select.value || res.from === select.value) {
            if (res.exchange < 1) {
                group1.push(res);
            } else if (res.exchange >= 1 && res.exchange < 1.5) {
                group2.push(res);
            } else if (res.exchange >= 1.5) {
                group3.push(res);
            }
        }
    });

    renderResult({
        group1,
        group2,
        group3,
    });
}

// render the result by group
function renderResult(data) {
    // group 1
    const divGroup1 = document.getElementById("group1");
    const ulGroup1 = document.getElementById("group1List");
    ulGroup1.innerHTML = ""; // remove all the existing li element before inserting new list
    data.group1.forEach((x) => {
        const li = document.createElement("li");
        li.innerText = `${x.from} - ${x.to}: ${x.exchange}`;
        ulGroup1.append(li);
    });
    divGroup1.append(ulGroup1);
    const count1 = document.getElementById("group1cnt");
    count1.innerText = `Count: ${data.group1.length}`;
    ulGroup1.parentNode.insertBefore(count1, ulGroup1.nextSibling);

    // group 2
    const divGroup2 = document.getElementById("group2");
    const ulGroup2 = document.getElementById("group2List");
    ulGroup2.innerHTML = ""; // remove all the existing li element before inserting new list
    data.group2.forEach((x) => {
        const li = document.createElement("li");
        li.innerText = `${x.from} - ${x.to}: ${x.exchange}`;
        ulGroup2.append(li);
    });
    divGroup2.append(ulGroup2);
    const count2 = document.getElementById("group2cnt");
    count2.innerText = `Count: ${data.group2.length}`;
    ulGroup2.parentNode.insertBefore(count2, ulGroup2.nextSibling);

    // group 3
    const divGroup3 = document.getElementById("group3");
    const ulGroup3 = document.getElementById("group3List");
    ulGroup3.innerHTML = ""; // remove all the existing li element before inserting new list
    data.group3.forEach((x) => {
        const li = document.createElement("li");
        li.innerText = `${x.from} - ${x.to}: ${x.exchange}`;
        ulGroup3.append(li);
    });
    divGroup3.append(ulGroup3);
    const count3 = document.getElementById("group3cnt");
    count3.innerText = `Count: ${data.group3.length}`;
    ulGroup3.parentNode.insertBefore(count3, ulGroup3.nextSibling);
}