var request = require("request");
var webdriver = require('selenium-webdriver'),By = webdriver.By,until = webdriver.until;
var driver = new webdriver.Builder().forBrowser('chrome').build(); //建瀏覽器

var fs = require("fs");
var cheerio = require("cheerio");
var station = ["466910","466920","466930","C0A980","C0A9A0","C0A9B0","C0A9C0","C0A9E0","C0A9F0","C0A9G0","C0AC40","C0AC70","C0AC80","C0AH40","C0AH70","C1A730","C1AC50"];
var station_name = ["鞍部","臺北","竹子湖","社子","大直","石牌","天母","士林","內湖","南港","大屯山","信義","文山","平等","松山","公館","關渡"];
var station_long = [121.529731,121.514853,121.544547,121.469681,121.542853,121.513817,121.537169,121.503019,121.575450,121.602906,121.522408,121.564597,121.575728,121.577086,121.550420,121.539539,121.469331];
var station_lat = [25.182586,25.037658,25.162078,25.109508,25.078047,25.116342,25.117494,25.090253,25.079422,25.055431,25.175675,25.037822,25.002350,25.129142,25.048710,25.014372,25.133486];
var station_num = 0;
var days = 1;


driver.wait(function(){
    while(station_num < station.length){
        test(station_num);
        station_num++;
    }
    return true;
},3000000);
driver.quit();

//Fake();

function test(station_num){
    driver.wait(function(){
        //days = 1;
        while(days <= 7){
            day(days,station_num);
            days++;
        }
        return true;
    },3000000);
}

function day(days,station_num){
    var url = "e-service.cwb.gov.tw/HistoryDataQuery/DayDataController.do?command=viewMain&station=" + station[station_num] + "&stname=" + station_name[station_num] + "&datepicker=2017-10-0" + days;    
    driver.get("http://" + url);
    driver.wait(until.elementIsVisible(driver.findElement(By.id('MyTable'))), 30000); //等頁面載完
    var isAnalysising = false;
    //取html
    driver.findElement(By.className('CSSTableGenerator')).getAttribute("innerHTML")
        .then(function(profile) {
            fs.writeFile('./data/' + station[station_num] + " "  + station_name[station_num] + ' HTML' + days + '.txt', profile, (err) => { //存起乃
                if (err) throw err;
                console.log('HTML saved!');
            });
            isAnalysising = true;
            analysis(profile,station_num,days);
            isAnalysising = false;            
    });
    driver.wait(function(){
        return !(isAnalysising);
    },10000);
}

function analysis(profile,station_num,days){
    var $ = cheerio.load(profile);
    //console.log(profile);
    var result = [];
    $('tbody tr').each(function(i, elem){ //取表格將資料切出來
        result.push($(this).text().split('\n'));
    });
    console.log(result.length);
    fs.writeFileSync("./data/" + station[station_num] + " "  + station_name[station_num] + " 2017-10-0" + days + ".json", JSON.stringify(result));
    //console.log(station[station_num] + " "  + station_name[station_num] + " 2017-10-0" + days);
    var output = [];
    var data = [];

    var fakeData = [];
    fakeData = Fake(fakeData);

    for(var i = 2;i<result.length;i++){
        var light = 1;
        if(parseInt(result[i][1].trim()) >= 6 && parseInt(result[i][1].trim()) <= 18)
            light = 0;
        data.push({
            time : " 2017/10/0" + days + "/" + result[i][1].trim() + ":00",
            temperature: result[i][4].trim(),
            humidity:result[i][6].trim(),
            light : light
        })
    }
    output.push({
        LoRaID : station[station_num],
        Long : station_long[station_num],
        Lat : station_lat[station_num],
        weather : data,
        sensor : fakeData
    });
    fs.writeFileSync("./result/" + station[station_num] + " "  + station_name[station_num] + " 2017-10-0" + days + ".json", JSON.stringify(output));
    
}

function Fake(fake){
    //Math.floor(Math.random()*(max-min+1)+min);//
    var clearTime = 0;
    var weight = 0;
    var throwTime = 0;
    for(var i = 1;i < 24;i++)
    {
        for(var j = 0;j < 60;j+=10)
        {
            var _weight = Math.floor(Math.random()*(299));
            var _clear = 0;
            var _throw = Math.floor(Math.random()*(19));

            weight += _weight;
            if(weight >= 5000){
                weight = 0;
                _weight = 0;
                _clear++;
            }

            clearTime += _clear;
            throwTime += _throw;
            if(j == 0)
            {
                fake.push({
                    time : "2017/10/1/" + i + ":00",
                    weight : weight,
                    clearTime : clearTime,
                    throwTime : throwTime
                });
            }
            else{
                fake.push({
                    time : "2017/10/1/" + i + ":" + j,
                    weight : weight,
                    clearTime : clearTime,
                    throwTime : throwTime
                });
            }
        }
    }
    fs.writeFileSync("fake.json", JSON.stringify(fake));    
    console.log(fake);
    return fake;
}

function abc(){
    for(var i = 0;i<station.length;i++)
    {
        for(var j = 1;j<=7;j++)
        {
            //console.log(url);
            request({
            url: url,
            method: "GET"
            }, function(e,r,b) {
            if(e || !b) { return; }
            var $ = cheerio.load(b);
            console.log(b);        
            var result = [];
            $('.MyTable tbody tr').each(function(i, elem){ //取表格將資料切出來
                result.push($(this).text().split('\n'));
            });
            console.log(result);
            fs.writeFileSync("./data/" + station[i] + " "  + station_name[i] + " 2017-10-0" + j.json, JSON.stringify(result));
            //console.log(station[i] + " "  + station_name[i] + " 2017-10-0" + j);
            sleep(2000);
            
            });
        }
    }

    function sleep(ms){
        var starttime= new Date().getTime();
        do{
        }while((new Date().getTime()-starttime)<ms)
        
    }
}