// 手動調整年度
let year = String(2025)
// 自動年度
let yearNow = new Date().getFullYear().toString();
// 包含下一年
yearNow = parseInt(yearNow) + 1

// API串接年度
let API_Url = `https://cdn.jsdelivr.net/gh/ruyut/TaiwanCalendar/data/${year}.json`
let API_Url_Auto = `https://cdn.jsdelivr.net/gh/ruyut/TaiwanCalendar/data/${yearNow}.json`

let btn = document.querySelector('.btn');
let title = document.querySelector('.title');

// 確保資料載入後再顯示
window.onload = function () {
    // 每年開始往前找，直到成功載入資料
    tryLoadAvailableYear(parseInt(yearNow));
};

// 嘗試載入某年度的資料，若 404 則自動往前一年繼續找
function tryLoadAvailableYear(year) {
    let url = `https://cdn.jsdelivr.net/gh/ruyut/TaiwanCalendar/data/${year}.json`;

    // 使用API調用
    axios.get(url)
        .then(response => {
            const data = response.data;
            console.log(`成功載入 ${year} 年資料`, data);

            // 更新 yearNow 成找到的正確年份
            yearNow = year.toString();

            // 總天數
            totalDay(data);
            // 放假日
            Holiday(data);
            // 補班日
            NoHoliday(data);
            // 標題渲染
            titleYear(yearNow);
            // 通知日
            TwoDay(data);
            // 開始遞歸查找資料
            findDataRecursive(year);
        })
        .catch(error => {
            if (error.response && error.response.status === 404) {
                // 若 API 不存在（404），則繼續往前一年嘗試
                console.warn(`${year} 年資料不存在，嘗試載入前一年`);
                tryLoadAvailableYear(year - 1);
            } else {
                // 其他錯誤情況
                console.error('錯誤:', error);
            }
        });
}

// 遞歸查找資料的函數
function findDataRecursive(currentYear) {
    if (currentYear < 2015) {
        return; // 防止無窮迴圈，限制最小年份
    }

    let Url = `https://cdn.jsdelivr.net/gh/ruyut/TaiwanCalendar/data/${currentYear}.json`;

    axios.get(Url)
        .then(() => {
            // API請求成功 有前一年的資料
            btn.innerHTML += `
                <button class="yearBtn" onclick="search(${currentYear})">${currentYear}年</button>
            `;
            // 調用下一年
            findDataRecursive(currentYear - 1);
        })
        .catch(error => {
            // API請求失敗，處理錯誤情況
            if (error.response && error.response.status === 404) {
                // console.log('API不存在，進行特定處理');
                // 找不到符合的年份資料，結束
            } else {
                // 其他錯誤情況
                console.error('錯誤:', error);
            }
        });
}



// 資訊函數
function totalDay(data) {
    // 今年日期數
    let totalDays = data.length
    console.log(`今年天數: ${totalDays}`);
}


// 判斷放假日帶入陣列
function Holiday(data) {
    let Holiday = [];
    let text ='';
    for (let i = 0; i < data.length; i++) {
        if (data[i].isHoliday) {
            if (data[i].week != "六" && data[i].week != "日") {
                Holiday.push(data[i].date)
                
                // 用於渲染 日期+假日別名
                text += `<li>${data[i].date} (${data[i].week}) ${data[i].description}</li>`
            }
        }
    }
    // 渲染
    document.querySelector('.Holiday').innerHTML = text
    console.log(`今年放假日: ${Holiday.length}`)
    console.log(Holiday);
}

// 判斷放假日帶入陣列
function NoHoliday(data) {
    let NoHoliday = [];
    let text ='';
    for (let i = 0; i < data.length; i++) {
        if (data[i].isHoliday == false && (data[i].week == '六' ||data[i].week == '日')) {
            NoHoliday.push(data[i].date)

            // 用於渲染 日期+補班
            text += `<li>${data[i].date} (${data[i].week}) ${data[i].description}</li>`

        }
    }
    // 渲染
    document.querySelector('.NoHoliday').innerHTML = text
    console.log(`今年補班日: ${NoHoliday.length}`)
    console.log(NoHoliday);
}

// 補班前兩天
function TwoDay(data) {
    let TwoDay = [];
    for (let i = 0; i < data.length; i++) {
        // 查詢補班
        if (data[i].isHoliday == false && (data[i].week == '六' ||data[i].week == '日')) {
            let count = 0;
            for (let ii = i - 1; ii >= 0 && count < 2; ii--) {
                if (data[ii].isHoliday === false && (data[ii].week === '一' || data[ii].week === '二' || data[ii].week === '三' || data[ii].week === '四' || data[ii].week === '五')) {
                    if (count == 1) {
                        TwoDay.push(data[ii].date)
                        break; // 跳脫
                    } else {
                        count++;
                    }
                }
            }
        }
    }
    console.log(`今年通知日: ${TwoDay.length}`)
    console.log(TwoDay);
}

// 渲染標題
function titleYear(year) {
    title.innerHTML = `<h1><span>${year}</span> 年資訊</h1>`
}

// 總渲染
function search(year) {
    let Url = `https://cdn.jsdelivr.net/gh/ruyut/TaiwanCalendar/data/${year}.json`

    axios.get(Url)
		.then(response => {
			const data = response.data;
			console.log(data)

            // 總天數
            totalDay(data)
            // 放假日
            Holiday(data)
            // 補班日
            NoHoliday(data)
            // 通知日
            TwoDay(data)
            // 標題渲染
            titleYear(year)
		})
        .catch(error => console.error('錯誤:', error));
}



