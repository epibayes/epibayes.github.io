function roundTotals(reportedCasesDirty,reportedDeathsDirty){ 
    let ceilingedcases=Math.ceil(reportedCasesDirty/100000)*100000

    let ceilingeddeaths=Math.ceil(reportedDeathsDirty/1000)*1000

    let reportedCases = ceilingedcases.toLocaleString();
    let reportedDeaths = ceilingeddeaths.toLocaleString();

    document.querySelector('#numberReportedCases').innerHTML = reportedCases;

    document.querySelector('#numberReportedDeaths').innerHTML = reportedDeaths;
}

function roundVax(totalvaxDirty,fullvaxDirty){
    let ceilingedtotal=Math.ceil(totalvaxDirty/1000000)*1000000

    let ceilingedfull=Math.ceil(fullvaxDirty/100000)*100000

    let cleantotal = ceilingedtotal.toLocaleString();
    let cleanfull = ceilingedfull.toLocaleString();

    document.querySelector('#totalvax_us').innerHTML = cleantotal;

    document.querySelector('#fullyvax_us').innerHTML = cleanfull;

}

async function jhutotals(){
    let formatteddate = d3.timeFormat("%m-%d-%Y")
    let today = new Date();
    let yesterday = new Date(new Date().setDate(new Date().getDate()-1));
    let twodaysago = new Date(new Date().setDate(new Date().getDate()-2));

    let today_nice = formatteddate(today);
    let yesterday_nice = formatteddate(yesterday);
    let twodaysago_nice = formatteddate(twodaysago);

    // console.log(typeof today_nice)

    todaysdata = `https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/${today_nice}.csv`
    yesterdaysdata = `https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/${yesterday_nice}.csv`
    twodaysagodata = `https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/${twodaysago_nice}.csv`

    try{
      mydata = await d3.csv(todaysdata, d3.autoType)

      // for troubleshooting :
      // mydata = await d3.csv(yesterdaysdata, d3.autoType)
    } 
    catch(err){
      console.log("there was an error getting today's data, get yesterday's data...")
      mydata = await d3.csv(yesterdaysdata, d3.autoType)
      
      // for troubleshooting :
      // mydata = await d3.csv(twodaysagodata, d3.autoType)
    }

    usdata = mydata.filter(d => d.Country_Region=== 'US')
    // console.log(usdata)
    let confirmedcount = d3.sum(usdata.map(d => d.Confirmed))
    let deathcount = d3.sum(usdata.map(d => d.Deaths))

    // console.log("confirmed and death:", confirmedcount, deathcount)

    roundTotals(confirmedcount, deathcount)
}

