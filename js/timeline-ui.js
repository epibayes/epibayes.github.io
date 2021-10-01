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

function miPercents(eighteenplus, sixtyfiveplus){
  document.querySelector('#plus18_mi').innerHTML = eighteenplus;
  document.querySelector('#plus65_mi').innerHTML = sixtyfiveplus;
}

async function jhutotals(){
    //debug statement to test if we got into here:
    // console.log("run jhutotals")
    let formatteddate = d3.timeFormat("%m-%d-%Y")
    let today = new Date();
    let yesterday = new Date(new Date().setDate(new Date().getDate()-1));
    let twodaysago = new Date(new Date().setDate(new Date().getDate()-2));

    let today_nice = formatteddate(today);
    let yesterday_nice = formatteddate(yesterday);
    let twodaysago_nice = formatteddate(twodaysago);

    // there were no new csvs after 09/29/2021, so hardset date to 09/29/2021
    let hardset_nice = '09-29-2021';

    todaysdata = `https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/${today_nice}.csv`
    yesterdaysdata = `https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/${yesterday_nice}.csv`
    twodaysagodata = `https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/${twodaysago_nice}.csv`

    hardsetdata = `https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/${hardset_nice}.csv`
    try{

      mydata = await d3.csv(todaysdata, d3.autoType)

      // for troubleshooting :
      // mydata = await d3.csv(yesterdaysdata, d3.autoType)
    } 
    catch(err){
      //use hardset data if no today's data (TEMPORARY)
      mydata = await d3.csv(hardsetdata, d3.autoType)
      // console.log("there was an error getting today's data, get yesterday's data...")
      // mydata = await d3.csv(yesterdaysdata, d3.autoType)
      
      // for troubleshooting :
      // mydata = await d3.csv(twodaysagodata, d3.autoType)
    }
    // console.log(mydata)
    // console.log(typeof mydata)
    usdata = mydata.filter(d => d.Country_Region=== 'US')
    // console.log(usdata)
    let confirmedcount = d3.sum(usdata.map(d => d.Confirmed))
    let deathcount = d3.sum(usdata.map(d => d.Deaths))

    // console.log("confirmed and death:", confirmedcount, deathcount)

    roundTotals(confirmedcount, deathcount)
}

async function cdcVaxNumbers(){
    // console.log("cdcvaxnumbers was called")

    cdcurl='https://jsonp.afeld.me/?callback=&url=https%3A%2F%2Fcovid.cdc.gov%2Fcovid-data-tracker%2FCOVIDData%2FgetAjaxData%3Fid%3Dvaccination_data'
    
    // try{
    //   mydata = await d3.json(cdcurl)
    //   console.log("i ran the try argument and got data")
    // } catch(err){
    //   console.log("unable to get cdc data from url")
    // }

    fetchJsonp(cdcurl)
        .then(res => res.json())
        .then(json => {
          let mydata = json;
          // console.log("my data is", mydata)
          // mydataContents = mydata.contents
          // console.log(mydataContents)
          //mydata with the stuff i need is a string that i need to parse...
          // mydataFormatted = JSON.parse(mydataContents)
          // mydataFormatted = mydataContents
          // console.log(mydataFormatted)

          // neededData = mydataFormatted.vaccination_data
          neededData=mydata.vaccination_data
          // console.log(neededData)

          //administered and fully vaccinated US totals
          let totalAdmin = neededData[0].Doses_Administered
          // console.log("totalAdmin", totalAdmin)
          let fullyVaxed= neededData[0].Series_Complete_Yes

          roundVax(totalAdmin, fullyVaxed)
          // console.log("fullyVaxed", fullyVaxed)

          //michigan percents
          michiganData = neededData.filter(d => d.Location === "MI")
          // console.log("miData", michiganData)

          // 18+ vax and 65+ vax numbers for michigan
          let vax18plus = michiganData[0].Series_Complete_18PlusPop_Pct
          // console.log(vax18plus)
          let vax65plus = michiganData[0].Series_Complete_65PlusPop_Pct
          // console.log(vax65plus)

          miPercents(vax18plus, vax65plus)

        });
        
    
}

