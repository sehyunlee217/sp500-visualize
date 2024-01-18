import * as d3 from "d3";
import * as Plot from "@observablehq/plot";

let plotdata = [];
let fedData = [];
let sp500Data = [];
let investData = [];

// Read all Data from csv file
const data_sp500 = await d3.csv("/SP500.csv");
const data_kospi = await d3.csv("/KOSPI.csv");
const data_feds = await d3.csv("/FEDFUNDS.csv");
const data_nasdaq = await d3.csv("/NASDAQ.csv");

data_sp500.map((data) => {
    plotdata.push({ Date: new Date(data.MonthDate), Close: Number(data.Price), Symbol: "S&P 500" });
});
data_sp500.map((data) => {
    sp500Data.push({ Date: new Date(data.MonthDate), Close: Number(data.Price), Symbol: "S&P 500" });
});
data_kospi.map((data) => {
    plotdata.push({ Date: new Date(data.Date), Close: Number(data.Close), Symbol: "KOSPI" });
});
data_nasdaq.map((data) => {
    plotdata.push({ Date: new Date(data.Date), Close: Number(data.Close), Symbol: "NASDAQ" });
});
data_feds.map((data) => {
    fedData.push({ Date: new Date(data.DATE), Close: Number(data.FEDFUNDS), Symbol: "FEDFUNDS" });
});

const plot = Plot.plot({
    width: 1000,
    color: {
        legend: true,
        scheme: "Accent"
    },
    y: {
        type: "log",
        label: "Change in price (%)",
        tickFormat: ((f) => (x) => f((x - 1) * 100))(d3.format("+d"))
    },
    marks: [
        Plot.ruleY([1]),
        Plot.lineY(plotdata, Plot.normalizeY({ x: "Date", y: "Close", stroke: "Symbol", tip: "x" })),
    ],
    grid: true,

});

const fedPlot = Plot.plot({
    width: 1000,
    color: {
        legend: true,
    },
    y: {
        type: "linear",
        label: "Interest Rate (bps)",
        nice: true
    },
    marks: [
        Plot.lineY(fedData, { x: "Date", y: "Close", stroke: "Symbol", tip: "x" }),
        Plot.crosshairX(fedData, { x: "Date", y: "Close" }),
        Plot.areaY(fedData, { x: "Date", y: "Close", fillOpacity: 0.3 })
    ],
    grid: true,
});

const stocksvg = document.querySelector("#stocks");
stocksvg.append(plot);

const fedsvg = document.querySelector('#feds');
fedsvg.append(fedPlot);

// Calculate result when invested 1000 dollars in S&P 500 every year

let annualSP500 = [];

let curYear, startPrice, endPrice;

// initial Investment of $1000
let yearVal = 1000;
investData.push({ Date: new Date('1985-01-01'), Value: Number(yearVal), Type: "Annual Investment" });

data_sp500.map((data) => {
    // At Jan. 01
    if (data.MonthDate.split("-")[1] == 1) {
        startPrice = data.Price;
        curYear = data.MonthDate.split("-")[0];
    }
    // At Dec. 01
    else if (data.MonthDate.split("-")[1] == 12) {
        endPrice = data.Price;
        let yearChange = (1 + (endPrice - startPrice) / startPrice);
        yearVal = 1000 + yearVal * yearChange;
        investData.push({ Date: new Date(data.MonthDate), Value: Number(yearVal), Type: "Annual Investment" });
        annualSP500.push({ Date: new Date(data.MonthDate), Value: Number(yearVal), Type: "Annual Investment in S&P500" });
    }
});

// Calculate result when invested 1000 dollars montly into S&P 500

let startMonth, endMonth;

// Montly Investment of $1000/12
let monthVal = 1000 / 12;
investData.push({ Date: new Date('1985-01-01'), Value: Number(monthVal), Type: "Monthly Investment" });

data_sp500.map((data) => {
    // Every Month
    endMonth = data.Price;
    let monthChange = (1 + ((endMonth - startMonth) / startMonth));
    if (monthChange) {
        monthVal = (1000 / 12) + monthVal * monthChange;
        investData.push({ Date: new Date(data.MonthDate), Value: Number(monthVal), Type: "Monthly Investment" });
    }
    startMonth = data.Price;
});

// S&P Compound Value Plot

const valuePlot = Plot.plot({
    marginLeft: 50,
    width: 1000,
    color: {
        legend: true,
        scheme: "Spectral"
    },
    y: {
        label: "Value(USD)",
    },
    marks: [
        Plot.lineY(investData, { x: "Date", y: "Value", stroke: "Type", tip: "xy" }),
    ],
    grid: true,
});

const investsvg = document.querySelector('#invest');
investsvg.append(valuePlot);


// Investing/Saving account; assuming FEDs rate to be the interest rate (not 100% true!)

let savingsData = [];

let savingVal = 1000;
savingsData.push({ Date: new Date('1985-01-01'), Value: Number(savingVal), Type: "Annual Deposit into savings" });

data_feds.map((data) => {
    fedData.push({ Date: new Date(data.DATE), Close: Number(data.FEDFUNDS), Symbol: "FEDFUNDS" });
});

data_feds.map((data) => {
    // At Dec. 01
    if (data.DATE.split("-")[1] == 12) {
        savingVal = 1000 + savingVal * (1 + data.FEDFUNDS / 100);
        savingsData.push({ Date: new Date(data.DATE), Value: Number(savingVal), Type: "Annual Deposit into savings" });
    }
});

// Compare annual S&P500 v.s annual savings

const annualCompPlot = Plot.plot({
    marginLeft: 50,
    width: 1000,
    color: {
        legend: true,
        scheme: "RdYlBu"
    },
    y: {
        label: "Value(USD)",
    },
    marks: [
        Plot.lineY(annualSP500, { x: "Date", y: "Value", stroke: "Type", tip: "xy" }),
        Plot.lineY(savingsData, { x: "Date", y: "Value", stroke: "Type", tip: "xy" }),
    ],
    grid: true,
});

const comparesvg = document.querySelector("#compare");
comparesvg.append(annualCompPlot)







